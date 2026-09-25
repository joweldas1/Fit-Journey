export function validateStep1({ age, heightFeet, heightInches, currentWeight }, lang = 'bn') {
  const a = Number(age);
  const ft = Number(heightFeet);
  const inc = Number(heightInches);
  const w = Number(currentWeight);

  if (isNaN(a) || a < 15 || a > 80) return { valid: false, msgKey: 'errAge' };
  if (isNaN(ft) || ft < 3 || ft > 7 || isNaN(inc) || inc < 0 || inc > 11) return { valid: false, msgKey: 'errHeight' };
  if (isNaN(w) || w < 30 || w > 180) return { valid: false, msgKey: 'errWeight' };

  return { valid: true };
}

export function validateStep2({ currentWeight, targetWeight, durationMonths }, lang = 'bn') {
  const cw = Number(currentWeight);
  const tw = Number(targetWeight);
  const duration = Number(durationMonths);

  if (isNaN(tw) || tw <= cw) return { valid: false, msgKey: 'errTargetWeight' };
  
  // Health safety check: Max ~4kg weight gain per month allowed
  const gainPerMonth = (tw - cw) / duration;
  if (gainPerMonth > 4) return { valid: false, msgKey: 'errUnrealisticTarget' };

  return { valid: true };
}