import FOOD_MASTER_DB from './food';

const rawApiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const cleanApiKey = rawApiKey.replace(/["';\s]/g, "").trim();

// Shudhu verified working model gulo thakbe
const PRIMARY_MODEL = "gemini-3.8-flash";
const BACKUP_MODEL = "gemini-2.0-flash";

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

function searchLocalFoods(normalizedQuery, detectedQty, isEnglish) {
  const exactMatch = FOOD_MASTER_DB.find(item => 
    normalizedQuery.includes(item.bn.toLowerCase()) || 
    normalizedQuery.includes(item.en.toLowerCase()) ||
    item.bn.toLowerCase().includes(normalizedQuery) ||
    item.en.toLowerCase().includes(normalizedQuery)
  );

  if (exactMatch) {
    const rawUnit = exactMatch.unit || 'plate';
    const cleanUnit = rawUnit.replace(/^[\d.]+\s*/, '').trim() || 'plate';
    return {
      type: 'SINGLE_MATCH',
      data: {
        name: isEnglish ? exactMatch.en : exactMatch.bn,
        nameBn: exactMatch.bn,
        nameEn: exactMatch.en,
        foodId: exactMatch.id,
        calories: Math.round(exactMatch.cal * detectedQty),
        protein: Math.round(exactMatch.p * detectedQty * 10) / 10,
        carbs: Math.round(exactMatch.c * detectedQty * 10) / 10,
        fat: Math.round(exactMatch.f * detectedQty * 10) / 10,
        portion: `${detectedQty} ${cleanUnit}`,
        source: 'local_database'
      }
    };
  }
  return null;
}

// 4 Seconds Strict Fast Caller
async function callGeminiFast(prompt) {
  // 3.8-flash রাখা হলো এবং ফলব্যাক মডেল
  const models = ["gemini-3.8-flash", "gemini-1.5-flash"];
  
  for (const model of models) {
    const controller = new AbortController();
    // ১০-১৫ সেকেন্ডের জন্য ১২ সেকেন্ড (12000ms) সেট করা হলো
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanApiKey}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[${model}] returned HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const cleanJson = rawText.replace(/```json/gi, "").replace(/```/gi, "").trim();
        return JSON.parse(cleanJson);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn(`[${model}] skipped/timed out:`, err.name);
    }
  }
  return null;
}

export async function analyzeFoodWithAI(foodQuery, lang = 'en') {
  const isEnglish = lang === 'en';
  const normalizedQuery = foodQuery.toLowerCase().replace(/[-_–—,./\\]/g, ' ').replace(/\s+/g, ' ').trim();

  const notFoundMsg = isEnglish ? "Your food was not found" : "আপনার খাবারটি পাওয়া যায় নি";
  const retryMsg = isEnglish ? "Please try again after a minute." : "দয়া করে এক মিনিট পর আবার চেষ্টা করুন।";

  if (!normalizedQuery || normalizedQuery.length < 2) {
    throw new Error(notFoundMsg);
  }

  const detectedQty = extractQuantity(normalizedQuery);
  const cacheKey = `fit_ai_fast_${lang}_${normalizedQuery}`;

  // 1. Instant Cache Check (0 ms)
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    try {
      return { type: 'SINGLE_MATCH', data: JSON.parse(cachedData) };
    } catch (e) {}
  }

  // 2. Ultra-compact Human Food Guard Prompt
  const targetLang = isEnglish ? "English" : "Bengali";
  const prompt = `Human Food Checker: "${foodQuery}".
Rule: If NOT edible food/drink prepared for human consumption (e.g. animal, tool, furniture, cloth, trash, gibberish), return EXACTLY: {"isFood":false}
If edible food, return raw JSON:
{"isFood":true,"name":"${targetLang} food name","nameBn":"Bengali name","nameEn":"English name","calories":number,"protein":number,"carbs":number,"fat":number,"portion":"${detectedQty} serving"}
Raw JSON only. No markdown.`;

  // 3. Fast Call (Max 4 seconds)
  let liveData = null;
  if (cleanApiKey) {
    liveData = await callGeminiFast(prompt);
  }

  // Handle AI Response
  if (liveData) {
    // Non-food / inedible item reject
    if (liveData.isFood === false) {
      throw new Error(notFoundMsg);
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
      return { type: 'SINGLE_MATCH', data: res };
    }
  }

  // 4. Fallback to Local 700 DB
  const localMatch = searchLocalFoods(normalizedQuery, detectedQty, isEnglish);
  if (localMatch) {
    return localMatch;
  }

  // 5. AI fail + local DB-te na thakle retry error
  throw new Error(retryMsg);
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



// AI-Powered Personalized Onboarding Calorie Target Calculator
export async function calculateUserCaloriePlanWithAI(data, lang = 'bn') {
  const isEnglish = lang === 'en';
  
  // অতি সংক্ষিপ্ত ও ক্লিন প্রম্পট (১-২ সেকেন্ডের দ্রুত উত্তরের জন্য)
  const prompt = `Dietitian Calculator: Calculate personalized daily calorie intake.
Metrics:
- Gender: ${data.gender}
- Age: ${data.age} yrs
- Height: ${data.heightFeet}ft ${data.heightInches}in (${data.heightCm}cm)
- Current Weight: ${data.currentWeight}kg
- Target Weight: ${data.targetWeight}kg
- Target Duration: ${data.durationMonths} months
- Profession / Activity: ${data.profession}
- Daily Work Hours: ${data.workHours} hours/day

Return STRICT JSON only, no markdown:
{
  "dailyCalorieTarget": number,
  "tdee": number,
  "bmr": number,
  "dailySurplus": number,
  "macros": {
    "protein": number,
    "carbs": number,
    "fat": number
  },
  "adviceBn": "1 concise sentence in Bengali about this specific work-routine diet",
  "adviceEn": "1 concise sentence in English about this specific work-routine diet"
}`;

  try {
    const aiData = await callGeminiFast(prompt);
    if (aiData && aiData.dailyCalorieTarget) {
      return {
        dailyCalorieTarget: Math.round(Number(aiData.dailyCalorieTarget)),
        tdee: Math.round(Number(aiData.tdee) || (Number(aiData.dailyCalorieTarget) - 500)),
        bmr: Math.round(Number(aiData.bmr) || 1600),
        dailySurplus: Math.round(Number(aiData.dailySurplus) || 500),
        macros: {
          protein: Math.round(Number(aiData.macros?.protein) || 120),
          carbs: Math.round(Number(aiData.macros?.carbs) || 350),
          fat: Math.round(Number(aiData.macros?.fat) || 60)
        },
        advice: isEnglish ? aiData.adviceEn : aiData.adviceBn,
        source: 'gemini_ai_personalized'
      };
    }
  } catch (err) {
    console.warn("AI Onboarding calculation failed, falling back to local formulas:", err);
  }

  // ফেইলসেফ ফলব্যাক: অফলাইন সায়েন্টিফিক ফর্মুলা (Mifflin-St Jeor)
  const isMale = data.gender === 'male';
  const weightKg = Number(data.currentWeight);
  const heightCm = Number(data.heightCm);
  const age = Number(data.age);

  // BMR
  let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + (isMale ? 5 : -161);

  // Activity multiplier based on profession & work hours
  let activityMultiplier = 1.2;
  const hours = Number(data.workHours) || 8;
  
  if (data.profession.includes('heavy') || data.profession.includes('ভারী')) {
    activityMultiplier = hours > 8 ? 1.75 : 1.6;
  } else if (data.profession.includes('moderate') || data.profession.includes('field') || data.profession.includes('মাঝারি')) {
    activityMultiplier = hours > 8 ? 1.55 : 1.45;
  } else if (data.profession.includes('light') || data.profession.includes('হালকা')) {
    activityMultiplier = 1.35;
  } else {
    activityMultiplier = 1.2; // Sedentary / Desk
  }

  const tdee = Math.round(bmr * activityMultiplier);
  const targetDiff = Number(data.targetWeight) - weightKg;
  const surplusDeficit = Math.round((targetDiff * 7700) / (Number(data.durationMonths) * 30));
  const dailyTarget = Math.max(tdee + surplusDeficit, 1400);

  return {
    dailyCalorieTarget: dailyTarget,
    tdee,
    bmr: Math.round(bmr),
    dailySurplus: surplusDeficit,
    macros: {
      protein: Math.round(weightKg * (isMale ? 2.0 : 1.7)),
      fat: Math.round((dailyTarget * 0.25) / 9),
      carbs: Math.round((dailyTarget - (weightKg * 2.0 * 4) - ((dailyTarget * 0.25))) / 4)
    },
    advice: isEnglish ? "Consistent calorie intake and adequate rest will yield the best results." : "নিয়মিত পর্যাপ্ত ক্যালোরি গ্রহণ ও বিশ্রাম আপনার লক্ষ্যে পৌঁছাতে সাহায্য করবে।",
    source: 'local_scientific_formula'
  };
}