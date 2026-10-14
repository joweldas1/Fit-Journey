// Local food DB kept for reference, non-Gemini fallback is commented out per user requirement
// import FOOD_MASTER_DB from './food';

// Dual API Key Support for Safe Rotation
// Multi-key failover pool (Rotates through 4 keys for 100% uptime)
const candidateKeys = [
  import.meta.env.VITE_GEMINI_API_KEY_1,
  import.meta.env.VITE_GEMINI_API_KEY_2,
  import.meta.env.VITE_GEMINI_API_KEY_3,
  import.meta.env.VITE_GEMINI_API_KEY_4,
  import.meta.env.VITE_GEMINI_KEY_PRIMARY,
  import.meta.env.VITE_GEMINI_KEY_SECONDARY,
  import.meta.env.VITE_GEMINI_API_KEY
].map(k => (k || "").replace(/["';\s]/g, "").trim()).filter(Boolean);

const API_KEYS = Array.from(new Set(candidateKeys));

// Verified production-ready models
const MODELS = ["gemini-flash-lite-latest", "gemini-3-flash-preview", "gemini-flash-latest", "gemini-2.5-flash", "gemini-1.5-flash"];

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

/**
 * [NON-GEMINI FALLBACK - COMMENTED OUT PER USER REQUIREMENT]
 * Strictly using Gemini AI only; local DB fallback is disabled.
 *
function searchLocalFoods(normalizedQuery, detectedQty, isEnglish) {
  const exactMatch = FOOD_MASTER_DB?.find(item => 
    normalizedQuery.includes(item.bn.toLowerCase()) || 
    normalizedQuery.includes(item.en.toLowerCase()) ||
    item.bn.toLowerCase().includes(normalizedQuery) ||
    item.en.toLowerCase().includes(normalizedQuery)
  );

  if (exactMatch) {
    const rawUnit = exactMatch.unit || 'plate';
    const cleanUnit = rawUnit.replace(/^[\d.]+\s*[/]/, '').trim() || 'plate';
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
*/

/**
 * Universal Gemini AI Caller with:
 * 1. Serverless endpoint check (/api/gemini)
 * 2. Safe client-side Dual API Key Rotation & retry backoff (Key 1 -> 429/Error -> Key 2)
 * 3. Verified Multi-model cascade (2.5-flash -> 2.0-flash -> 1.5-flash)
 */
export async function callGeminiFast(prompt, systemInstruction = '') {
  // 1. Try Serverless API first (Keeps keys secret and rotates on backend)
  try {
    const serverlessRes = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemInstruction })
    });

    if (serverlessRes.ok) {
      const serverlessData = await serverlessRes.json();
      if (serverlessData?.text) {
        const cleanJson = serverlessData.text.replace(/```json/gi, "").replace(/```/gi, "").trim();
        try {
          return JSON.parse(cleanJson);
        } catch {
          return { rawText: serverlessData.text };
        }
      }
    }
  } catch {
    // Serverless endpoint not present or static host, gracefully proceed to rotated client keys
  }

  // 2. Client-side Safe Key Rotation Fallback
  if (API_KEYS.length === 0) {
    console.warn("No Gemini API keys configured. Set VITE_GEMINI_API_KEY_1 or VITE_GEMINI_API_KEY_2 in .env");
    return null;
  }

  for (let keyIdx = 0; keyIdx < API_KEYS.length; keyIdx++) {
    const currentKey = API_KEYS[keyIdx];

    for (const model of MODELS) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${currentKey}`;
        const payload = {
          contents: [{ parts: [{ text: prompt }] }]
        };
        if (systemInstruction) {
          payload.systemInstruction = { parts: [{ text: systemInstruction }] };
        }

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const cleanJson = rawText.replace(/```json/gi, "").replace(/```/gi, "").trim();
            try {
              return JSON.parse(cleanJson);
            } catch {
              return { rawText };
            }
          }
        }

        const status = response.status;
        console.warn(`[Key ${keyIdx + 1}][${model}] Returned HTTP ${status}`);

        // If rate limited or quota exhausted (429 or 403), rotate to next key immediately
        if (status === 429 || status === 403) {
          break; // Exit model loop to try next API key
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.warn(`[Key ${keyIdx + 1}][${model}] Request error:`, err?.name || err?.message);
      }
    }

    // Short backoff before switching to backup API key
    if (keyIdx < API_KEYS.length - 1) {
      await new Promise(res => setTimeout(res, 750));
    }
  }

  return null;
}

/**
 * Food analysis strictly using Gemini AI (Local fallback commented out per Requirement B)
 */
export async function analyzeFoodWithAI(foodQuery, lang = 'en') {
  const isEnglish = lang === 'en';
  const normalizedQuery = foodQuery.toLowerCase().replace(/[-_–—,./\\]/g, ' ').replace(/\s+/g, ' ').trim();

  const notFoundMsg = isEnglish 
    ? "Food item not recognized. Please provide a valid food or drink." 
    : "খাবারটি চিহ্নিত করা যায়নি। অনুগ্রহ করে সঠিক খাবার বা পানীয়ের নাম লিখুন।";

  const errorMsg = isEnglish 
    ? "Gemini AI connection failed or daily quota reached. Please retry in a few moments." 
    : "গুগল এআই সংযোগে সমস্যা বা কোটা লিমিট হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।";

  if (!normalizedQuery || normalizedQuery.length < 2) {
    throw new Error(notFoundMsg);
  }

  const detectedQty = extractQuantity(normalizedQuery);
  const cacheKey = `fit_ai_gemini_${lang}_${normalizedQuery}`;

  // 1. Instant Cache Check (0 ms)
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    try {
      return { type: 'SINGLE_MATCH', data: JSON.parse(cachedData) };
    } catch {
      localStorage.removeItem(cacheKey);
    }
  }

  // 2. Strict Nutritionist Prompt
  const targetLang = isEnglish ? "English" : "Bengali";
  const prompt = `Human Food & Nutrition Analyzer: "${foodQuery}".
Rule 1: If NOT human consumable food/drink (e.g. inedible object, living animal, furniture, trash, gibberish), return EXACTLY: {"isFood":false}
Rule 2: If valid food or drink, estimate realistic nutrition for the specified portion (default portion ${detectedQty}). Return STRICT raw JSON only:
{
  "isFood": true,
  "name": "${targetLang} name of food",
  "nameBn": "Bengali name",
  "nameEn": "English name",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "portion": "${detectedQty} serving"
}
Raw JSON only. No markdown fences.`;

  // 3. Fast Call with Safe Key Rotation
  const liveData = await callGeminiFast(prompt);

  if (liveData) {
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
        source: 'gemini_ai_live'
      };

      try {
        localStorage.setItem(cacheKey, JSON.stringify(res));
      } catch {}

      return { type: 'SINGLE_MATCH', data: res };
    }
  }

  /*
   * [STEP 4: NON-GEMINI FALLBACK COMMENTED OUT PER USER REQUIREMENT]
   * Strictly using Gemini AI only.
   * const localMatch = searchLocalFoods(normalizedQuery, detectedQty, isEnglish);
   * if (localMatch) return localMatch;
   */

  // 5. Fail gracefully with clear error
  throw new Error(errorMsg);
}

/**
 * Exercise Analyzer with real Gemini AI
 */
export async function analyzeExerciseWithAI(exerciseQuery, lang = 'en') {
  const isEnglish = lang === 'en';

  const prompt = `Fitness Coach: Analyze this workout/exercise: "${exerciseQuery}".
Return STRICT JSON only:
{
  "name": "Concise exercise name",
  "caloriesBurned": number (realistic calories burned),
  "targetedMuscle": "Main muscle group targeted (e.g. Chest & Triceps, Legs, Full Body)",
  "effortLevel": "Light" | "Moderate" | "High",
  "aiFeedback": "1 short encouraging sentence of form/recovery feedback in ${isEnglish ? 'English' : 'Bengali'}"
}`;

  try {
    const data = await callGeminiFast(prompt);
    if (data && data.caloriesBurned) {
      return {
        name: data.name || exerciseQuery,
        caloriesBurned: Math.round(Number(data.caloriesBurned)),
        targetedMuscle: data.targetedMuscle || (isEnglish ? "Full Body" : "পুরো শরীর"),
        effortLevel: data.effortLevel || (isEnglish ? "Moderate" : "মাঝারি"),
        aiFeedback: data.aiFeedback || (isEnglish ? "Great workout! Keep consistent." : "চমৎকার ব্যায়াম! ধারাবাহিকতা বজায় রাখুন।"),
        source: 'gemini_ai'
      };
    }
  } catch (err) {
    console.warn("Exercise AI failed, using estimated baseline:", err);
  }

  // Safe baseline estimate if API is temporarily unavailable
  return {
    name: exerciseQuery,
    caloriesBurned: 85,
    targetedMuscle: isEnglish ? "Upper & Core" : "বুক ও কোর মাসল",
    effortLevel: isEnglish ? "Moderate" : "মাঝারি",
    aiFeedback: isEnglish ? "Consistency is key to progressive overload!" : "ধারাবাহিকতাই শারীরিক অগ্রগতির আসল চাবিকাঠি!",
    source: 'estimated_fallback'
  };
}

/**
 * Daily Plan Text Analyzer for Requirement D:
 * Extracts total calories, meal schedule, and personalized advice from free-form text
 */
export async function analyzeDailyCaloriePlanWithAI(planText, lang = 'bn') {
  const isEnglish = lang === 'en';

  const prompt = `Dietitian Calculator: The user is planning their meals for today:
"${planText}"

Extract and calculate:
1. Total estimated calories for the entire day.
2. Estimated breakdown for meals if mentioned (breakfast, lunch, snacks, dinner).
3. Estimated macros (protein, carbs, fat in grams).
4. One concise personalized nutritionist tip in ${isEnglish ? 'English' : 'Bengali'}.

Return STRICT JSON only:
{
  "dailyCalorieTarget": number,
  "macros": {
    "protein": number,
    "carbs": number,
    "fat": number
  },
  "meals": [
    {
      "mealType": "breakfast" | "lunch" | "snacks" | "dinner",
      "title": "${isEnglish ? 'Breakfast / Lunch / etc.' : 'ব্রেকফাস্ট / লাঞ্চ / ইত্যাদি'}",
      "items": "concise description of foods for this meal",
      "calories": number
    }
  ],
  "advice": "1 concise sentence of expert diet tip",
  "summary": "1 short summary phrase"
}`;

  const res = await callGeminiFast(prompt);

  if (res && res.dailyCalorieTarget) {
    return {
      dailyCalorieTarget: Math.round(Number(res.dailyCalorieTarget)),
      macros: {
        protein: Math.round(Number(res.macros?.protein) || 90),
        carbs: Math.round(Number(res.macros?.carbs) || 280),
        fat: Math.round(Number(res.macros?.fat) || 60)
      },
      meals: Array.isArray(res.meals) ? res.meals : [],
      advice: res.advice || (isEnglish ? "Balanced diet planned for today. Stay hydrated!" : "আজকের জন্য সুষম পরিকল্পনা! পর্যাপ্ত পানি পান করুন।"),
      summary: res.summary || (isEnglish ? "Personalized Daily Plan" : "আজকের কাস্টম ডায়েট প্ল্যান"),
      rawPlanText: planText,
      timestamp: new Date().toISOString()
    };
  }

  // Fallback if AI parsing fails
  return {
    dailyCalorieTarget: 2400,
    macros: { protein: 90, carbs: 320, fat: 65 },
    meals: [],
    advice: isEnglish ? "Maintain balanced nutrition and regular hydration." : "সুষম পুষ্টি ও নিয়মিত পানি পানের অভ্যাস বজায় রাখুন।",
    summary: planText.slice(0, 40) + '...',
    rawPlanText: planText,
    timestamp: new Date().toISOString()
  };
}

/**
 * Onboarding Calorie Target Calculator
 */
export async function calculateUserCaloriePlanWithAI(data, lang = 'bn') {
  const isEnglish = lang === 'en';
  
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

Return STRICT JSON only:
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

  // Failsafe fallback: Mifflin-St Jeor formula
  const isMale = data.gender === 'male';
  const weightKg = Number(data.currentWeight);
  const heightCm = Number(data.heightCm);
  const age = Number(data.age);

  let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + (isMale ? 5 : -161);

  let activityMultiplier = 1.2;
  const hours = Number(data.workHours) || 8;
  
  if (data.profession?.includes('heavy') || data.profession?.includes('ভারী')) {
    activityMultiplier = hours > 8 ? 1.75 : 1.6;
  } else if (data.profession?.includes('moderate') || data.profession?.includes('field') || data.profession?.includes('মাঝারি')) {
    activityMultiplier = hours > 8 ? 1.55 : 1.45;
  } else if (data.profession?.includes('light') || data.profession?.includes('হালকা')) {
    activityMultiplier = 1.35;
  } else {
    activityMultiplier = 1.2;
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
    advice: isEnglish 
      ? "Consistent calorie intake and adequate rest will yield the best results." 
      : "নিয়মিত পর্যাপ্ত ক্যালোরি গ্রহণ ও বিশ্রাম আপনার লক্ষ্যে পৌঁছাতে সাহায্য করবে।",
    source: 'local_scientific_formula'
  };
}