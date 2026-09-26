import FOOD_MASTER_DB from './food';

// 1. API Key Clean Retrieval
const rawApiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const cleanApiKey = rawApiKey.replace(/["';\s]/g, "").trim();

// আপনার ড্রপডাউনে থাকা ৩.৮ ফ্ল্যাশ এবং ৩.৫ ফ্ল্যাশ-লাইট মডেলগুলো সবার আগে রাখা হলো
const MODELS_TO_TRY = [
  "gemini-3.8-flash",
  "3.8-flash",
  "gemini-3.5-flash-lite",
  "3.5-flash-lite",
  "gemini-3.1-pro",
  "3.1-pro",
  "gemini-2.0-flash",
  "gemini-1.5-flash"
];

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
    name: itemName,
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
        nameBn: exactMatch.bn,
        nameEn: exactMatch.en,
        foodId: exactMatch.id,
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
  const cacheKey = `fit_ai_v10_${lang}_${normalizedQuery}`;

  // 1. Cache Check
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    try {
      const parsed = JSON.parse(cachedData);
      console.log("⚡ Found in Cache:", parsed.name);
      return { type: 'SINGLE_MATCH', data: parsed };
    } catch (e) {
      console.warn("Cache parse error", e);
    }
  }

  // 2. Direct REST Call with 3.8 / 3.5 Models
  if (cleanApiKey) {
    const targetLang = isEnglish ? "English" : "Bengali";
// Target prompt with strict non-food detection
    const prompt = `
      You are an accurate clinical dietitian nutritional calculator.
      Analyze this user input: "${foodQuery}".

      CRITICAL RULE:
      Determine if this input is a real edible food, meal, beverage, or grocery item meant for human consumption.
      If it is NOT food (e.g. furniture like table/chair, electronics, animals, toys, random objects, toxic substances), set "isFood": false.

      If it IS food, set "isFood": true.

      Return STRICT valid JSON without markdown or backticks:
      {
        "isFood": boolean,
        "name": "Food name in ${targetLang}",
        "nameBn": "Food name in Bengali",
        "nameEn": "Food name in English",
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "portion": "${detectedQty} portion"
      }
    `;

  for (const model of MODELS_TO_TRY) {
      try {
        console.log(`📡 Calling Gemini AI with [${model}]...`);
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanApiKey}`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        // ১. রেসপন্স সফল হয়েছে কি না চেক
        if (!response.ok) {
          console.warn(`Model ${model} returned HTTP ${response.status}`);
          continue;
        }

        // ২. ডাটা রিসিভ ও ক্লিন করা
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (rawText) {
          const cleanJson = rawText.replace(/```json/gi, "").replace(/```/gi, "").trim();
          const liveData = JSON.parse(cleanJson);

          // ৩. এইখানে বসবে লাইভ ডাটা ও Non-food গার্ড
          if (liveData) {
            // খাবার না হলে এরর থ্রো করবে
            if (liveData.isFood === false) {
              throw new Error(isEnglish ? "This is not an edible food item!" : "এটি কোনো খাবার নয়! সঠিক খাবারের নাম লিখুন।");
            }

            if (liveData.calories || liveData.calories === 0) {
              const cleanName = (liveData.name || foodQuery)
                .replace(/^[\d.]+\s*(plate|pc|টি|প্লেট|বাটি|cup|bowl|glass)\s*/i, '')
                .trim();

              const res = {
                name: cleanName,
                nameBn: liveData.nameBn || cleanName,
                nameEn: liveData.nameEn || cleanName,
                calories: Math.round(Number(liveData.calories)),
                protein: Math.round((Number(liveData.protein) || 0) * 10) / 10,
                carbs: Math.round((Number(liveData.carbs) || 0) * 10) / 10,
                fat: Math.round((Number(liveData.fat) || 0) * 10) / 10,
                portion: liveData.portion || `${detectedQty} serving`,
                source: 'live_analyzed'
              };

              localStorage.setItem(cacheKey, JSON.stringify(res));
              console.log(`🎉 Success using Model [${model}]:`, res);
              return { type: 'SINGLE_MATCH', data: res };
            }
          }
        }
      } catch (err) {
        // খাবার না হলে সরাসরি বাইরে এরর পাস করবে যেন লাল টোস্ট দেখায়
        if (err.message && (err.message.includes("খাবার নয়") || err.message.includes("not an edible"))) {
          throw err;
        }
        console.warn(`Attempt failed for ${model}:`, err);
      }
    }
  }

  // 3. Fallback to Local 700 DB
  console.warn("⚠️ AI Models unavailable, loading from 700 Local Database...");
  const localResult = searchLocalFoods(normalizedQuery, detectedQty, isEnglish);
  if (localResult) {
    return localResult;
  }

  // 4. Default Suggestions
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