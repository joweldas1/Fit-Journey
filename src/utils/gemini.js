import { GoogleGenerativeAI } from "@google/generative-ai";
import FOOD_MASTER_DB from './food';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AQ.Ab8RN6KRBGlixcmClean_Key_Here"; // Tomar asol key rakhbe
const genAI = new GoogleGenerativeAI(apiKey);

function extractQuantity(text) {
  const clean = text.toLowerCase().trim();
  
  if (/(half|অর্ধেক|অর্ধ)\b/i.test(clean)) return 0.5;
  if (/(one and half|দেড়|দেড়টি)\b/i.test(clean)) return 1.5;
  
  const bnToEnMap = { '১': 1, '২': 2, '৩': 3, '৪': 4, '৫': 5, '৬': 6, '৭': 7, '৮': 8, '৯': 9, '০': 0 };
  const replaced = clean.replace(/[১২৩৪৫৬৭৮৯০]/g, match => bnToEnMap[match] || match);
  
  const numMatch = replaced.match(/(\d+(\.\d+)?)/);
  if (numMatch) return parseFloat(numMatch[1]);

  if (/\b(ek|ekta|akta|one|এক|একটি|১)\b/i.test(clean)) return 1;
  if (/\b(dui|duita|duta|two|দুই|দুটি|২)\b/i.test(clean)) return 2;
  if (/\b(tin|tinta|three|তিন|তিনটি|৩)\b/i.test(clean)) return 3;
  if (/\b(char|charta|four|চার|চারটি|৪)\b/i.test(clean)) return 4;
  if (/\b(pach|pasta|five|পাঁচ|পাঁচটি|৫)\b/i.test(clean)) return 5;
  
  return 1;
}

function formatPortionAndTitle(item, detectedQty, isEnglish) {
  const rawUnit = item.unit || 'plate';
  const cleanUnit = rawUnit.replace(/^[\d.]+\s*/, '').trim() || 'plate';

  const portionText = `${detectedQty} ${cleanUnit}`;
  const itemName = isEnglish ? item.en : item.bn;

  return {
    name: itemName, // <-- EIKHAN THEKE PORTION TEXT SHORIYE FELECHI
    portion: portionText
  };
}

function searchLocalFoods(normalizedQuery, detectedQty, isEnglish) {
  const exactMatch = FOOD_MASTER_DB.find(item => 
    normalizedQuery.includes(item.bn.toLowerCase()) || 
    normalizedQuery.includes(item.en.toLowerCase()) ||
    item.bn.toLowerCase().includes(normalizedQuery) ||
    item.en.toLowerCase().includes(normalizedQuery)
  );

  if (exactMatch) {
    const formatted = formatPortionAndTitle(exactMatch, detectedQty, isEnglish);
    return {
      type: 'SINGLE_MATCH',
      data: {
        name: formatted.name,
        calories: Math.round(exactMatch.cal * detectedQty),
        protein: Math.round(exactMatch.p * detectedQty * 10) / 10,
        carbs: Math.round(exactMatch.c * detectedQty * 10) / 10,
        fat: Math.round(exactMatch.f * detectedQty * 10) / 10,
        portion: formatted.portion,
        source: 'local_database'
      }
    };
  }

  const tokens = normalizedQuery.split(/\s+/).filter(t => t.length > 1);
  const relevantList = FOOD_MASTER_DB.filter(item => {
    const itemText = `${item.bn} ${item.en}`.toLowerCase();
    return tokens.some(token => itemText.includes(token));
  }).slice(0, 5);

  if (relevantList.length > 0) {
    return {
      type: 'MULTIPLE_SUGGESTIONS',
      items: relevantList.map(item => {
        const formatted = formatPortionAndTitle(item, detectedQty, isEnglish);
        return {
          ...item,
          displayName: formatted.name,
          portion: formatted.portion,
          calories: Math.round(item.cal * detectedQty),
          protein: Math.round(item.p * detectedQty * 10) / 10,
          carbs: Math.round(item.c * detectedQty * 10) / 10,
          fat: Math.round(item.f * detectedQty * 10) / 10
        };
      })
    };
  }

  return null;
}

export async function analyzeFoodWithAI(foodQuery, lang = 'en') {
  const isEnglish = lang === 'en';
  const normalizedQuery = foodQuery.toLowerCase().replace(/[-_–—,./\\]/g, ' ').replace(/\s+/g, ' ').trim();

  if (!normalizedQuery || normalizedQuery.length < 2) {
    throw new Error(isEnglish ? "Please enter a valid food name." : "সঠিক খাবারের নাম লিখুন।");
  }

  const detectedQty = extractQuantity(normalizedQuery);
  
  // v4 cache key dewa hoyeche jate ager "1 plate" namer sathe jora thaka data muche jay
  const cacheKey = `fit_journey_food_v4_${normalizedQuery}`;

  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    try {
      const parsed = JSON.parse(cachedData);
      return { type: 'SINGLE_MATCH', data: parsed };
    } catch (e) {
      console.warn("Cache parsing error", e);
    }
  }

  // 1. AI SEARCH FIRST
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const targetLang = isEnglish ? "English" : "Bengali";
    
    // Eikhane prompt-e clearly bola hoyeche je namer sathe portion add na korte
    const prompt = `
      You are an accurate clinical dietitian nutritional calculator.
      Analyze: "${foodQuery}".
      Portion standard: Use realistic, standard home-cooked preparation.
      Format rule: Never repeat digits in portion (e.g. return strictly "${detectedQty} plate" or "${detectedQty} pc").
      Name rule: ONLY return the clean food name in ${targetLang}. DO NOT include the quantity or portion in the "name" field.
      Return STRICT raw JSON without markdown or codeblocks:
      {
        "name": "Clean food name only in ${targetLang}",
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "portion": "${detectedQty} plate"
      }
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().replace(/```json/gi, "").replace(/```/gi, "").trim();
    const liveData = JSON.parse(text);

    if (liveData && liveData.calories) {
      // Clean up just in case AI still adds numbers to the name
      const cleanName = (liveData.name || foodQuery).replace(/^[\d.]+\s*(plate|pc|টি|প্লেট|বাটি|cup|bowl)\s*/i, '').trim();

      const res = {
        name: cleanName,
        calories: Math.round(liveData.calories),
        protein: Math.round((liveData.protein || 0) * 10) / 10,
        carbs: Math.round((liveData.carbs || 0) * 10) / 10,
        fat: Math.round((liveData.fat || 0) * 10) / 10,
        portion: liveData.portion || `${detectedQty} plate`,
        source: 'live_analyzed'
      };

      localStorage.setItem(cacheKey, JSON.stringify(res));
      return { type: 'SINGLE_MATCH', data: res };
    }
  } catch (err) {
    console.warn("AI search unavailable, falling back to 700 DB:", err);
  }

  // 2. FALLBACK TO LOCAL DB
  const localResult = searchLocalFoods(normalizedQuery, detectedQty, isEnglish);
  if (localResult) {
    if (localResult.type === 'SINGLE_MATCH') {
      localStorage.setItem(cacheKey, JSON.stringify(localResult.data));
    }
    return localResult;
  }

  // 3. SUGGESTIONS
  return {
    type: 'MULTIPLE_SUGGESTIONS',
    items: FOOD_MASTER_DB.slice(0, 4).map(item => {
      const formatted = formatPortionAndTitle(item, detectedQty, isEnglish);
      return {
        ...item,
        displayName: formatted.name,
        portion: formatted.portion,
        calories: item.cal
      };
    })
  };
}

export async function analyzeExerciseWithAI(exerciseQuery, lang = 'en') {
  const isEnglish = lang === 'en';
  return {
    name: exerciseQuery,
    caloriesBurned: 60,
    targetedMuscle: isEnglish ? "Upper Body" : "বুক ও হাত",
    effortLevel: isEnglish ? "Moderate" : "মাঝারি",
    aiFeedback: isEnglish ? "Great consistency! Keep going." : "ধারাবাহিকতা বজায় রাখুন!",
    source: 'local_rules'
  };
}