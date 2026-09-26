import FOOD_MASTER_DB from '../utils/food'; // Apnar food.js file-er path thik kore diben

/**
 * Super Strong Quantity Extractor (Handles Bengali digits, words, fractions & English)
 */
function extractQuantity(text) {
  const clean = text.toLowerCase().trim();
  
  // Fractions & Bengali half support
  if (/(half|অর্ধেক|অর্ধ)\b/i.test(clean)) return 0.5;
  if (/(ek-shorasi|one and half|দেড়|দেড়টি)\b/i.test(clean)) return 1.5;
  
  // Convert Bengali numbers to English digits
  const bnToEnMap = { '১': 1, '২': 2, '৩': 3, '৪': 4, '৫': 5, '৬': 6, '৭': 7, '৮': 8, '৯': 9, '০': 0 };
  const replaced = clean.replace(/[১২৩৪ەس৬৭৮৯০]/g, match => bnToEnMap[match] || match);
  
  const numMatch = replaced.match(/(\d+(\.\d+)?)/);
  if (numMatch) return parseFloat(numMatch[1]);

  // Word-based quantities (Bengali & English)
  if (/\b(ek|ekta|akta|one|এক|একটি|১)\b/i.test(clean)) return 1;
  if (/\b(dui|duita|duta|two|দুই|দুটি|২)\b/i.test(clean)) return 2;
  if (/\b(tin|tinta|three|তিন|তিনটি|৩)\b/i.test(clean)) return 3;
  if (/\b(char|charta|four|চার|চারটি|৪)\b/i.test(clean)) return 4;
  if (/\b(pach|pasta|five|পাঁচ|পাঁচটি|৫)\b/i.test(clean)) return 5;
  
  return 1; // Default multiplier
}

/**
 * Ultimate Local Food Search & Regex Matcher Engine (No AI Needed)
 */
export async function analyzeFoodWithAI(foodQuery, lang = 'en') {
  const isEnglish = lang === 'en';
  const queryClean = foodQuery.toLowerCase().trim();

  if (!queryClean || queryClean.length < 2 || /^[\d\s\p{P}]+$/u.test(queryClean)) {
    throw new Error(
      isEnglish 
        ? "⚠️ Please enter a valid food item name." 
        : "⚠️ Doya kore ekti sothik khabarer nam likhun."
    );
  }

  const detectedQty = extractQuantity(queryClean);
  const cacheKey = `fit_journey_food_${queryClean}`;

  // 1. Check LocalStorage Cache first (If previously searched or manually logged)
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    try {
      const parsed = JSON.parse(cachedData);
      const baseQty = parsed.baseQty || 1;
      const multiplier = detectedQty / baseQty;

      return {
        name: parsed.name,
        calories: Math.round(parsed.calories * (parsed.isManual ? 1 : Math.max(1, multiplier))),
        protein: Math.round(parsed.protein * (parsed.isManual ? 1 : Math.max(1, multiplier)) * 10) / 10,
        carbs: Math.round(parsed.carbs * (parsed.isManual ? 1 : Math.max(1, multiplier)) * 10) / 10,
        fat: Math.round(parsed.fat * (parsed.isManual ? 1 : Math.max(1, multiplier)) * 10) / 10,
        portion: parsed.portion || `${detectedQty} serving`,
        aiTip: parsed.aiTip || 'Loaded from local storage cache.',
        source: 'cache'
      };
    } catch (e) {
      console.warn("Cache parse error:", e);
    }
  }

  // 2. Strong Fuzzy & Keyword Matching across all 700 foods in FOOD_MASTER_DB
  let matchedFood = null;
  
  // Exact or Partial Match in Bengali or English name
  matchedFood = FOOD_MASTER_DB.find(item => 
    queryClean.includes(item.bn.toLowerCase()) || 
    queryClean.includes(item.en.toLowerCase()) ||
    item.bn.toLowerCase().includes(queryClean) ||
    item.en.toLowerCase().includes(queryClean)
  );

  // If direct match not found, try token/keyword matching (e.g., "dim", "bhat", "biryani")
  if (!matchedFood) {
    const tokens = queryClean.split(/\s+/);
    matchedFood = FOOD_MASTER_DB.find(item => {
      const itemText = `${item.bn} ${item.en}`.toLowerCase();
      return tokens.some(token => token.length > 2 && itemText.includes(token));
    });
  }

  // 3. If food is found in 700 food database
  if (matchedFood) {
    const baseQty = 1; // Base unit from database item
    const finalCalories = Math.round(matchedFood.cal * detectedQty);
    const finalProtein = Math.round(matchedFood.p * detectedQty * 10) / 10;
    const finalCarbs = Math.round(matchedFood.c * detectedQty * 10) / 10;
    const finalFat = Math.round(matchedFood.f * detectedQty * 10) / 10;

    const result = {
      name: isEnglish ? `${detectedQty} ${matchedFood.en}` : `${detectedQty} ${matchedFood.unit} ${matchedFood.bn}`,
      calories: finalCalories,
      protein: finalProtein,
      carbs: finalCarbs,
      fat: finalFat,
      portion: `${detectedQty} ${matchedFood.unit}`,
      aiTip: isEnglish ? "High density local nutritional choice." : "lokal khabar theke sothik pushtiman.",
      source: 'local_master_db'
    };

    // Save to cache for future instant lookup
    localStorage.setItem(cacheKey, JSON.stringify({
      ...result,
      baseQty: detectedQty
    }));

    return result;
  }

  // 4. If not found in 700 foods, trigger Manual Entry fallback smoothly
  throw new Error(JSON.stringify({
    type: "AI_FAILED_MANUAL_REQUIRED",
    query: queryClean,
    message: isEnglish 
      ? "⚠️ Food not found in database. Please enter values manually." 
      : "⚠️ Ei khabar ti database e nei. Doya kore manually value input দিন।"
  }));
}

/**
 * Exercise analysis engine
 */
export async function analyzeExerciseWithAI(exerciseQuery, lang = 'en') {
  const clean = exerciseQuery.toLowerCase();
  let burned = 50;
  let muscle = lang === 'bn' ? "বুক ও হাত" : "Upper Body";

  if (/push|পুশ/i.test(clean)) {
    burned = 65;
    muscle = lang === 'bn' ? "বুক ও ট্রাইসেপস" : "Chest & Triceps";
  } else if (/squat|স্কোয়াট|স্কোয়াট/i.test(clean)) {
    burned = 75;
    muscle = lang === 'bn' ? "পায়ের মাংসপেশি" : "Legs & Core";
  }

  return {
    name: exerciseQuery,
    caloriesBurned: burned,
    targetedMuscle: muscle,
    effortLevel: lang === 'bn' ? "মাঝারি" : "Moderate",
    aiFeedback: lang === 'bn' ? "ধারাবাহিকতা বজায় রাখুন!" : "Keep pushing forward!"
  };
}