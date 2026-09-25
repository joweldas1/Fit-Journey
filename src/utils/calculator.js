/**
 * Mifflin-St Jeor Equation & Caloric Surplus Calculation
 */
export function calculateFitnessTarget({ age, gender = 'male', heightCm, currentWeight, targetWeight, durationMonths }) {
  const ageNum = Number(age);
  const heightNum = Number(heightCm);
  const currentWeightNum = Number(currentWeight);
  const targetWeightNum = Number(targetWeight);
  const durationNum = Number(durationMonths);

  // 1. Calculate BMR (Mifflin-St Jeor)
  let bmr = (10 * currentWeightNum) + (6.25 * heightNum) - (5 * ageNum);
  bmr = gender === 'male' ? bmr + 5 : bmr - 161;

  // 2. Activity Multiplier (1.375 for lightly to moderately active with commute)
  const tdee = Math.round(bmr * 1.375);

  // 3. Weight Gain Goal & Surplus
  const weightToGain = targetWeightNum - currentWeightNum;
  const daysTotal = durationNum * 30; // Approx 30 days per month
  
  // 1 kg body weight ~ 7700 kcal
  const totalSurplusNeeded = weightToGain * 7700;
  const dailySurplus = Math.round(totalSurplusNeeded / daysTotal);

  // 4. Daily Targets
  const dailyCalorieTarget = Math.max(tdee + dailySurplus, tdee + 300); // Minimum +300 safe surplus
  
  // Recommended protein: ~1.6g to 2.0g per kg of current body weight
  const targetProtein = Math.round(currentWeightNum * 1.8);
  
  // Fat target ~ 25% of calories (9 kcal/g), Carbs ~ remainder (4 kcal/g)
  const targetFat = Math.round((dailyCalorieTarget * 0.25) / 9);
  const targetCarbs = Math.round((dailyCalorieTarget - (targetProtein * 4) - (targetFat * 9)) / 4);

  return {
    bmr: Math.round(bmr),
    tdee,
    weightToGain,
    dailySurplus,
    dailyCalorieTarget,
    macros: {
      protein: targetProtein,
      carbs: targetCarbs,
      fat: targetFat
    }
  };
}