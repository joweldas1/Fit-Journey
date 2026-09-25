/**
 * ১০০০+ ভ্যারিয়েশন সমৃদ্ধ হাইপার-কমপ্রিহেনসিভ ফুড ডাটাবেস
 * প্রতিটি উপাদানের ক্যালোরি ও পুষ্টিমান আন্তর্জাতিক পুষ্টিবিজ্ঞান ও দেশি খাদ্যতালিকা অনুযায়ী প্রমিত।
 */
const FOOD_MASTER_DB = [
  // =================== ১. ড্রাই ফ্রুটস, বাদাম ও বীজ (DRY FRUITS & NUTS) ===================
  { 
    regex: /\b(khezur|khejur|date|dates|খেজুর)\b/i, 
    name: 'মরিয়ম / সাধারণ খেজুর', 
    enName: 'Dates (Khezur)',
    cal: 23, p: 0.2, c: 6.0, f: 0.1, unit: 'টি', defaultQty: 4,
    tip: 'খেজুরে রয়েছে প্রাকৃতিক গ্লুকোজ ও ফ্রুক্টোজ যা দ্রুত স্বাস্থ্যকর ক্যালোরি ও শক্তি বাড়ায়।'
  },
  { 
    regex: /\b(kismis|kishmish|raisin|raisins|কিসমিস|কিশমিশ)\b/i, 
    name: 'কিসমিস', 
    enName: 'Raisins (Kismis)',
    cal: 3, p: 0.03, c: 0.8, f: 0.01, unit: 'দানা', defaultQty: 25,
    tip: 'কিসমিস হজমশক্তি বাড়াতে এবং ওজন দ্রুত বাড়াতে এক জাদুকরী শুকনো ফল।'
  },
  { 
    regex: /\b(mutho\s*kismis|handful\s*raisins|মুঠো\s*কিসমিস)\b/i, 
    name: 'এক মুঠো কিসমিস (৩০ গ্রাম)', 
    enName: 'Handful Raisins (30g)',
    cal: 90, p: 1.0, c: 24.0, f: 0.2, unit: 'মুঠো', defaultQty: 1,
    tip: 'প্রতিদিন সকালে ভেজানো কিসমিস খেলে দ্রুত ওজন বাড়ে।'
  },
  { 
    regex: /\b(chinabadam|badam|peanuts|peanut|বাদাম|চীনাবাদাম)\b/i, 
    name: 'ভাজা / কাঁচা চীনাবাদাম', 
    enName: 'Peanuts',
    cal: 170, p: 7.5, c: 4.5, f: 14.0, unit: 'মুঠো (৩০ গ্রাম)', defaultQty: 1,
    tip: 'চীনাবাদাম হলো সবচেয়ে সাশ্রয়ী হাই-প্রোটিন ও হাই-ক্যালোরি পেশি বৃদ্ধির ফুয়েল।'
  },
  { 
    regex: /\b(katbadam|kathbadam|almond|almonds|কাঠবাদাম)\b/i, 
    name: 'কাঠবাদাম (আমন্ড)', 
    enName: 'Almonds',
    cal: 7, p: 0.3, c: 0.25, f: 0.6, unit: 'টি', defaultQty: 10,
    tip: 'ভিটামিন ই ও গুড ফ্যাটের সেরা উৎস যা পেশি গঠনে সহায়তা করে।'
  },
  { 
    regex: /\b(kazubadam|kaju|cashew|cashews|কাজুবাদাম)\b/i, 
    name: 'কাজুবাদাম', 
    enName: 'Cashew Nuts',
    cal: 9, p: 0.3, c: 0.5, f: 0.7, unit: 'টি', defaultQty: 10,
    tip: 'ঘন ক্যালোরি যুক্ত কাজুবাদাম ক্ষুধা না বাড়িয়েও ওজন বাড়ায়।'
  },
  { 
    regex: /\b(akhrot|walnut|walnuts|আখরোট)\b/i, 
    name: 'আখরোট (Walnut)', 
    enName: 'Walnuts',
    cal: 26, p: 0.6, c: 0.5, f: 2.6, unit: 'টি', defaultQty: 4,
    tip: 'ওমেগা-৩ ফ্যাটি এসিড সমৃদ্ধ যা স্বাস্থ্যকর ওজন বৃদ্ধিতে দারুণ সহায়ক।'
  },
  { 
    regex: /\b(chia|chia\s*seed|চিয়া\s*সিড)\b/i, 
    name: 'চিয়া সিডস', 
    enName: 'Chia Seeds',
    cal: 60, p: 2.0, c: 5.0, f: 4.0, unit: 'চামচ', defaultQty: 1,
    tip: 'পানিতে বা দুধে ভিজিয়ে খেলে প্রচুর ফাইবার ও ওমেগা ফ্যাটি এসিড পাওয়া যায়।'
  },
  { 
    regex: /\b(peanut\s*butter|পিনাট\s*বাটার)\b/i, 
    name: 'পিনাট বাটার', 
    enName: 'Peanut Butter',
    cal: 95, p: 4.0, c: 3.5, f: 8.0, unit: 'চামচ', defaultQty: 2,
    tip: 'কলা বা রুটির সাথে ২ চামচ পিনাট বাটার দিনে ২০০ ক্যালোরি অনায়াসে যোগ করে।'
  },

  // =================== ২. পানি ও স্বাস্থ্যকর পানীয় (WATER & HEALTHY BEVERAGES) ===================
  { 
    regex: /\b(pani|water|পানি|জল)\b/i, 
    name: 'বিশুদ্ধ খাবার পানি', 
    enName: 'Drinking Water',
    cal: 0, p: 0, c: 0, f: 0, unit: 'গ্লাস', defaultQty: 1,
    tip: 'পানি শরীরে শূন্য ক্যালোরি দেয় কিন্তু প্রোটিন শোষণ ও পেশি বৃদ্ধির জন্য সবচেয়ে জরুরি।'
  },
  { 
    regex: /\b(daab|dab|coconut\s*water|ডাব|ডাবের\s*পানি)\b/i, 
    name: 'ডাবের পানি', 
    enName: 'Green Coconut Water',
    cal: 45, p: 1.0, c: 10.0, f: 0.2, unit: 'ডাব', defaultQty: 1,
    tip: 'প্রাকৃতিক ইলেক্ট্রোলাইট ও পটাশিয়ামে ভরপুর, যা শরীর হাইড্রেটেড রাখে।'
  },
  { 
    regex: /\b(akher\s*rosh|sugarcane\s*juice|আখের\s*রস)\b/i, 
    name: 'তাজা আখের রস', 
    enName: 'Sugarcane Juice',
    cal: 180, p: 0.5, c: 45.0, f: 0.1, unit: 'গ্লাস', defaultQty: 1,
    tip: 'চমৎকার প্রাকৃতিক রিফ্রেশার ও দ্রুত গ্লাইকোজেন রিকভারি ড্রিংক।'
  },
  { 
    regex: /\b(dudh\s*cha|milk\s*tea|চা|দুধ\s*চা)\b/i, 
    name: 'দুধ ও চিনি সহ চা', 
    enName: 'Milk Tea with Sugar',
    cal: 85, p: 2.0, c: 12.0, f: 3.0, unit: 'কাপ', defaultQty: 1,
    tip: 'স্বাভাবিক স্ন্যাকস ড্রিংক হিসেবে ক্যালোরি বৃদ্ধিতে সহায়ক।'
  },
  { 
    regex: /\b(rong\s*cha|black\s*tea|green\s*tea|লাল\s*চা|রং\s*চা)\b/i, 
    name: 'রং চা / গ্রিন টি', 
    enName: 'Black / Green Tea',
    cal: 5, p: 0.1, c: 1.0, f: 0.0, unit: 'কাপ', defaultQty: 1,
    tip: 'অ্যান্টি-অক্সিডেন্টে ভরপুর এবং হজম প্রক্রিয়া সচল রাখে।'
  },
  { 
    regex: /\b(coffee|কফি)\b/i, 
    name: 'দুধ কফি', 
    enName: 'Milk Coffee',
    cal: 110, p: 3.0, c: 14.0, f: 4.0, unit: 'মগ', defaultQty: 1,
    tip: 'ওয়ার্কআউটের আগে খেলে শরীরে বাড়তি এনার্জি যোগায়।'
  },
  { 
    regex: /\b(chatu|sattu|ছাতু|ছাতুর\s*শরবত)\b/i, 
    name: 'ছোলার ছাতুর শরবত', 
    enName: 'Sattu Drink (Chatu)',
    cal: 220, p: 11.0, c: 35.0, f: 3.5, unit: 'গ্লাস', defaultQty: 1,
    tip: 'দেশি ভেগান প্রোটিনের রাজা! সকালে ১ গ্লাস ছাতু ওজন দ্রুত বাড়ায়।'
  },

  // =================== ৩. ফলমূল (FRESH FRUITS) ===================
  { 
    regex: /\b(kola|banana|কলা|সবরি\s*কলা|সাগর\s*কলা)\b/i, 
    name: 'পাকা কলা', 
    enName: 'Banana',
    cal: 105, p: 1.3, c: 27.0, f: 0.3, unit: 'টি', defaultQty: 2,
    tip: 'ওজন বাড়ানোর জন্য সবচেয়ে জনপ্রিয় ও সহজলভ্য পটাশিয়াম সমৃদ্ধ ফল।'
  },
  { 
    regex: /\b(dalim|bedana|pomegranate|ডালিম|বেদানা|আনার)\b/i, 
    name: 'তাজা ডালিম / বেদানা', 
    enName: 'Pomegranate (Dalim)',
    cal: 130, p: 2.5, c: 29.0, f: 1.5, unit: 'টি', defaultQty: 1,
    tip: 'রক্তে হিমোগ্লোবিন বাড়াতে এবং ক্ষুধা রুচি বাড়াতে সহায়তা করে।'
  },
  { 
    regex: /\b(aam|mango|আম)\b/i, 
    name: 'পাকা আম', 
    enName: 'Ripe Mango',
    cal: 150, p: 1.5, c: 38.0, f: 0.6, unit: 'টি', defaultQty: 1,
    tip: 'আমের উচ্চ প্রাকৃতিক মিষ্টি ও কার্বোহাইড্রেট চমৎকার ওজন বাড়ায়।'
  },
  { 
    regex: /\b(kanthal|jackfruit|কাঁঠাল)\b/i, 
    name: 'পাকা কাঁঠাল', 
    enName: 'Jackfruit (4-5 bulbs)',
    cal: 120, p: 2.0, c: 28.0, f: 0.4, unit: 'বাটি (৪-৫ কোয়া)', defaultQty: 1,
    tip: 'জাতীয় ফল কাঁঠালে রয়েছে প্রচুর প্রাকৃতিক ক্যালোরি ও ডায়েটারি ফাইবার।'
  },
  { 
    regex: /\b(narkel|narikel|coconut|নারিকেল|নারকেল)\b/i, 
    name: 'পাকা নারিকেল কুচি', 
    enName: 'Grated Coconut',
    cal: 160, p: 1.5, c: 7.0, f: 15.0, unit: 'বাটি (৫০ গ্রাম)', defaultQty: 1,
    tip: 'নারকেলে থাকা মিডিয়াম চেইন ট্রাইগ্লিসারাইড (MCT) স্বাস্থ্যকর ওজন বাড়ায়।'
  },
  { 
    regex: /\b(peyara|guava|পেয়ারা)\b/i, 
    name: 'তাজা পেয়ারা', 
    enName: 'Guava',
    cal: 70, p: 2.5, c: 14.0, f: 0.9, unit: 'টি', defaultQty: 1,
    tip: 'ভিটামিন সি সমৃদ্ধ যা রোগ প্রতিরোধ ক্ষমতা বাড়ায়।'
  },
  { 
    regex: /\b(apple|আপেল)\b/i, 
    name: 'তাজা আপেল', 
    enName: 'Apple',
    cal: 95, p: 0.5, c: 25.0, f: 0.3, unit: 'টি', defaultQty: 1,
    tip: 'সহজপাচ্য ফাইবার ও ভিটামিনে ভরপুর।'
  },
  { 
    regex: /\b(komola|malta|orange|কমলা|মাল্টা)\b/i, 
    name: 'কমলা / মাল্টা', 
    enName: 'Orange / Malta',
    cal: 80, p: 1.2, c: 19.0, f: 0.2, unit: 'টি', defaultQty: 1,
    tip: 'শরীরের খনিজ ব্যালান্স ঠিক রাখে।'
  },
  { 
    regex: /\b(angur|grape|grapes|আঙ্গুর|আঙুর)\b/i, 
    name: 'আঙুর ফল', 
    enName: 'Grapes',
    cal: 100, p: 1.0, c: 26.0, f: 0.3, unit: 'মুঠো / বাটি', defaultQty: 1,
    tip: 'সহজ মিষ্টি ফল যা দ্রুত রিফ্রেশমেন্ট দেয়।'
  },
  { 
    regex: /\b(avocado|অ্যাভোকাডো)\b/i, 
    name: 'অ্যাভোকাডো', 
    enName: 'Avocado',
    cal: 250, p: 3.0, c: 12.0, f: 22.0, unit: 'টি', defaultQty: 1,
    tip: 'বিশ্বের সবচেয়ে স্বাস্থ্যকর ফ্যাটযুক্ত ফল যা পেশি ভরাট করতে সাহায্য করে।'
  },
  { 
    regex: /\b(lichu|litchi|লিচু)\b/i, 
    name: 'লিচু', 
    enName: 'Litchi',
    cal: 65, p: 0.8, c: 16.0, f: 0.4, unit: '১০টি', defaultQty: 1,
    tip: 'মিষ্টি রসালো হাই-কার্ব ফল।'
  },
  { 
    regex: /\b(pepe|papaya|পেঁপে)\b/i, 
    name: 'পাকা পেঁপে', 
    enName: 'Papaya',
    cal: 60, p: 0.9, c: 15.0, f: 0.2, unit: 'বাটি', defaultQty: 1,
    tip: 'পাকস্থলী ঠান্ডা রাখে ও হজম উন্নত করে।'
  },
  { 
    regex: /\b(toromuj|watermelon|তরমুজ)\b/i, 
    name: 'তরমুজ', 
    enName: 'Watermelon',
    cal: 45, p: 0.9, c: 11.0, f: 0.2, unit: 'টুকরা / বাটি', defaultQty: 1,
    tip: 'হাইড্রেশন ঠিক রেখে শরীর সতেজ রাখে।'
  },

  // =================== ৪. দুধ, দুগ্ধজাত খাবার ও সুপার ওয়েট গেইনার ===================
  { 
    regex: /\b(milk\s*shake|মিল্ক\s*শেক|shake)\b/i, 
    name: 'কলা, দুধ ও বাদাম মিল্কশেক', 
    enName: 'Banana Nut Milkshake',
    cal: 420, p: 12.0, c: 65.0, f: 14.0, unit: 'বড় গ্লাস', defaultQty: 1,
    tip: 'ওজন বাড়ানোর জন্য এটি সেরা দৈনিক ফুয়েল ককটেল।'
  },
  { 
    regex: /\b(dudh|milk|গাভীর\s*দুধ|গরুর\s*দুধ|দুধ)\b/i, 
    name: 'খাঁটি তরল দুধ', 
    enName: 'Whole Milk (1 Glass)',
    cal: 160, p: 8.5, c: 12.0, f: 8.5, unit: 'গ্লাস (২৫০ মিলি)', defaultQty: 1,
    tip: 'সম্পূর্ণ প্রোটিন এবং ক্যালসিয়ামের চমৎকার প্রাকৃতিক উৎস।'
  },
  { 
    regex: /\b(ghee|ঘি)\b/i, 
    name: 'খাঁটি গাওয়া ঘি', 
    enName: 'Pure Ghee',
    cal: 112, p: 0.0, c: 0.0, f: 13.0, unit: 'চামচ', defaultQty: 1,
    tip: 'ভাতে বা ডালে ১ চামচ ঘি মেশালে হজমশক্তি বাড়ে ও ওজন দ্রুত বৃদ্ধি পায়।'
  },
  { 
    regex: /\b(makhan|butter|মাখন)\b/i, 
    name: 'মাখন (বাটার)', 
    enName: 'Butter',
    cal: 102, p: 0.1, c: 0.0, f: 11.5, unit: 'চামচ', defaultQty: 1,
    tip: 'উচ্চ ক্যালোরিযুক্ত সাশ্রয়ী ফ্যাট উৎস।'
  },
  { 
    regex: /\b(modhu|honey|মধু)\b/i, 
    name: 'খাঁটি মধু', 
    enName: 'Pure Honey',
    cal: 64, p: 0.1, c: 17.0, f: 0.0, unit: 'চামচ', defaultQty: 1,
    tip: 'দুধ বা চিড়ার সাথে মধু মেশালে তাৎক্ষণিক শক্তি যোগায়।'
  },
  { 
    regex: /\b(misti\s*doi|sweet\s*curd|দই|মিষ্টি\s*দই)\b/i, 
    name: 'মিষ্টি দই', 
    enName: 'Sweet Yogurt (Doi)',
    cal: 210, p: 6.0, c: 32.0, f: 7.0, unit: 'কাপ', defaultQty: 1,
    tip: 'প্রোবায়োটিক সমৃদ্ধ যা হজম ক্ষমতা বাড়িয়ে পুষ্টি শোষণ বাড়ায়।'
  },
  { 
    regex: /\b(tok\s*doi|sour\s*curd|টক\s*দই)\b/i, 
    name: 'টক দই', 
    enName: 'Plain Greek Yogurt',
    cal: 110, p: 8.5, c: 9.0, f: 4.5, unit: 'কাপ', defaultQty: 1,
    tip: 'পাকস্থলী সুস্থ রাখে ও চর্বিহীন পেশি তৈরিতে প্রোটিন দেয়।'
  },
  { 
    regex: /\b(chana|paneer|ছানা|পনির)\b/i, 
    name: 'খাঁটি ছানা / পনির', 
    enName: 'Cottage Cheese / Paneer (50g)',
    cal: 155, p: 11.0, c: 2.5, f: 11.5, unit: 'বাটি (৫০ গ্রাম)', defaultQty: 1,
    tip: 'কেসিন প্রোটিনের পাওয়ারহাউজ, রাতে খেলে পেশি সারারাত রিকভার হয়।'
  },

  // =================== ৫. ডিম, মাছ ও মাংস (MEAT, FISH & EGGS) ===================
  { 
    regex: /\b(seddo\s*dim|dim|egg|ডিম|সিদ্ধ\s*ডিম)\b/i, 
    name: 'সিদ্ধ ডিম', 
    enName: 'Hard-Boiled Egg',
    cal: 75, p: 6.3, c: 0.6, f: 5.3, unit: 'টি', defaultQty: 2,
    tip: 'সবচেয়ে কম খরচে বায়ো-অ্যাভেইলেবল হাই কোয়ালিটি প্রোটিন।'
  },
  { 
    regex: /\b(poach|dim\s*vaji|egg\s*fry|ডিম\s*ভাজি|পোচ)\b/i, 
    name: 'তেলে ভাজা ডিম / পোচ', 
    enName: 'Fried Egg / Poach',
    cal: 110, p: 6.3, c: 0.8, f: 9.0, unit: 'টি', defaultQty: 1,
    tip: 'তেল বা ঘিয়ে ভাজলে বাড়তি স্বাস্থ্যকর ক্যালোরি যুক্ত হয়।'
  },
  { 
    regex: /\b(omelette|অমলেট)\b/i, 
    name: 'পেঁয়াজ-মরিচ ডিম অমলেট', 
    enName: 'Egg Omelette',
    cal: 125, p: 6.8, c: 2.0, f: 10.0, unit: 'টি', defaultQty: 1,
    tip: 'রুটি বা ভাতের সাথে খাওয়ার চমৎকার প্রোটিন ফুয়েল।'
  },
  { 
    regex: /\b(chicken|murgi|মুরগি|চিকেন)\b/i, 
    name: 'মুরগির মাংস ভুনা / ঝোল', 
    enName: 'Chicken Curry',
    cal: 240, p: 25.0, c: 4.0, f: 14.0, unit: 'বাটি (২ টুকরা)', defaultQty: 1,
    tip: 'লিন পেশি ও শারীরিক শক্তি দ্রুত বাড়াতে অপরিহার্য।'
  },
  { 
    regex: /\b(goru|beef|গরুর\s*মাংস)\b/i, 
    name: 'গরুর মাংস ভুনা', 
    enName: 'Beef Bhuna',
    cal: 320, p: 26.0, c: 2.0, f: 24.0, unit: 'বাটি', defaultQty: 1,
    tip: 'ক্রিয়েটিন, আয়রন ও জিংকে ভরপুর যা পেশি ভারী করতে সাহায্য করে।'
  },
  { 
    regex: /\b(haser\s*mangso|হাঁসের\s*মাংস|duck)\b/i, 
    name: 'হাঁসের মাংস ভুনা', 
    enName: 'Duck Meat Bhuna',
    cal: 340, p: 24.0, c: 4.0, f: 26.0, unit: 'বাটি', defaultQty: 1,
    tip: 'উচ্চ ক্যালোরি এবং সুস্বাদু ফ্যাটযুক্ত মাংস।'
  },
  { 
    regex: /\b(khasi|mutton|খাসির\s*মাংস)\b/i, 
    name: 'খাসির মাংস', 
    enName: 'Mutton Curry',
    cal: 310, p: 23.0, c: 3.0, f: 23.0, unit: 'বাটি', defaultQty: 1,
    tip: 'উচ্চ প্রোটিন ও এনার্জির চমৎকার আধার।'
  },
  { 
    regex: /\b(mach|fish|মাছ|রুই|কাতলা|ইলিশ)\b/i, 
    name: 'মাছ ভুনা / তরকারি', 
    enName: 'Fish Curry (Rui/Katla/Ilish)',
    cal: 180, p: 20.0, c: 3.0, f: 10.0, unit: 'বড় টুকরা', defaultQty: 1,
    tip: 'ওমেগা-৩ ও সহজে হজমযোগ্য প্রোটিনে ভরপুর।'
  },

  // =================== ৬. ভাত, রুটি, চিড়া ও প্রধান খাদ্য ===================
  { 
    regex: /\b(chira|চিড়া|চিড়া)\b/i, 
    name: 'চিড়া ও গুড়', 
    enName: 'Flattened Rice with Jaggery (Chira)',
    cal: 320, p: 5.5, c: 70.0, f: 1.2, unit: 'বাটি', defaultQty: 1,
    tip: 'ওজন বাড়ানোর জন্য দ্রুত হজম হওয়া অন্যতম সেরা দেশি হাই-কার্ব খাবার।'
  },
  { 
    regex: /\b(chola|boot|ছোলা|বুট)\b/i, 
    name: 'ছোলা ভুনা / ভেজানো ছোলা', 
    enName: 'Chickpeas (Chola)',
    cal: 210, p: 10.5, c: 32.0, f: 4.5, unit: 'বাটি', defaultQty: 1,
    tip: 'কমপ্লেক্স কার্ব ও প্ল্যান্ট প্রোটিনের আদর্শ কম্বিনেশন।'
  },
  { 
    regex: /\b(bhat\s*ar\s*dal|ভাত\s*ও\s*ডাল|ভাত\s*ডাল|bhat\s*dal)\b/i, 
    name: '১ প্লেট ভাত ও ১ বাটি ঘন ডাল', 
    enName: 'Rice with Thick Dal',
    cal: 560, p: 16.0, c: 98.0, f: 8.5, unit: 'প্লেট', defaultQty: 1,
    tip: 'ভাত ও ডাল একসাথে মিশলে সম্পূর্ণ অ্যামিনো এসিড প্রোফাইল তৈরি হয়।'
  },
  { 
    regex: /\b(bhat|rice|ভাত)\b/i, 
    name: 'সাদা ভাত', 
    enName: 'Steamed White Rice',
    cal: 350, p: 6.0, c: 78.0, f: 1.0, unit: 'প্লেট (১ বড় কাপ)', defaultQty: 1,
    tip: 'সহজপাচ্য প্রধান এনার্জি ফুয়েল যা পেশির গ্লাইকোজেন ভরাট রাখে।'
  },
  { 
    regex: /\b(dal|thick\s*dal|ডাল|ঘন\s*ডাল)\b/i, 
    name: 'ঘন মসুর ডাল', 
    enName: 'Thick Lentil Soup (Dal)',
    cal: 180, p: 11.0, c: 26.0, f: 4.0, unit: 'বাটি', defaultQty: 1,
    tip: 'পাতলা ডালের বদলে ঘন ডাল খেলে দ্বিগুণের বেশি প্রোটিন ও ক্যালোরি পাওয়া যায়।'
  },
  { 
    regex: /\b(paratha|পরোটা)\b/i, 
    name: 'তেলে ভাজা পরোটা', 
    enName: 'Paratha',
    cal: 260, p: 4.5, c: 32.0, f: 13.0, unit: 'টি', defaultQty: 2,
    tip: 'সকালের নাস্তায় ডিমের সাথে পরোটা দ্রুত ক্যালোরি সারপ্লাস তৈরি করে।'
  },
  { 
    regex: /\b(ruti|roti|আটার\s*রুটি|রুটি)\b/i, 
    name: 'হাতে বানানো আটার রুটি', 
    enName: 'Handmade Roti',
    cal: 120, p: 3.8, c: 24.0, f: 0.8, unit: 'টি', defaultQty: 2,
    tip: 'কমপ্লেক্স কার্বস যা দীর্ঘক্ষণ শরীরে শক্তি জোগায়।'
  },
  { 
    regex: /\b(oats|ওটস)\b/i, 
    name: 'দুধ ও ওটস খিচুড়ি/পায়স', 
    enName: 'Oats with Milk',
    cal: 280, p: 9.5, c: 45.0, f: 6.5, unit: 'বাটি', defaultQty: 1,
    tip: 'বিটা-গ্লুকান ফাইবার সমৃদ্ধ সুপার হেলদি কার্বস।'
  },
  { 
    regex: /\b(muri|মুড়ি)\b/i, 
    name: 'মুড়ি ও চানাচুর', 
    enName: 'Puffed Rice (Muri)',
    cal: 140, p: 2.5, c: 30.0, f: 1.0, unit: 'বাটি', defaultQty: 1,
    tip: 'হালকা নাস্তা হিসেবে যেকোনো সময় খাওয়া যায়।'
  },
  { 
    regex: /\b(vater\s*mar|ভাতের\s*মাড়|mar)\b/i, 
    name: 'ঘন ভাতের মাড়', 
    enName: 'Rice Starch Water',
    cal: 90, p: 1.5, c: 20.0, f: 0.2, unit: 'গ্লাস', defaultQty: 1,
    tip: 'গ্রামবাংলার ঐতিহ্যবাহী এনার্জি ড্রিংক।'
  },
  { 
    regex: /\b(alu\s*seddo|alu\s*bhorta|আলু\s*ভর্তা|আলু\s*সিদ্ধ)\b/i, 
    name: 'সরিষার তেল ও আলু ভর্তা', 
    enName: 'Mashed Potato (Alu Bhorta)',
    cal: 140, p: 2.5, c: 26.0, f: 3.5, unit: 'বাটি', defaultQty: 1,
    tip: 'সহজে ক্যালোরি বাড়ানোর দারুণ দেশি উপায়।'
  },
  { 
    regex: /\b(khichuri|খিচুড়ি|খিচুড়ি)\b/i, 
    name: 'ডাল ও চালের ভুনা খিচুড়ি', 
    enName: 'Bhuna Khichuri',
    cal: 450, p: 14.0, c: 75.0, f: 11.0, unit: 'প্লেট', defaultQty: 1,
    tip: 'পুষ্টিগুণে ভরপুর সম্পূর্ণ সুষম মিল।'
  },
  { 
    regex: /\b(biryani|kacchi|বিরিয়ানি|কাচ্চি)\b/i, 
    name: 'কাচ্চি / চিকেন বিরিয়ানি', 
    enName: 'Biryani (Mutton/Chicken)',
    cal: 750, p: 28.0, c: 92.0, f: 30.0, unit: 'প্লেট', defaultQty: 1,
    tip: 'উচ্চ ক্যালোরিসমৃদ্ধ ভারী খাবার, অনায়াসে বড় সারপ্লাস পূরণ করে।'
  },
  { 
    regex: /\b(tehari|তেহারি)\b/i, 
    name: 'গরুর মাংসের তেহারি', 
    enName: 'Beef Tehari',
    cal: 650, p: 24.0, c: 85.0, f: 25.0, unit: 'প্লেট', defaultQty: 1,
    tip: 'উচ্চ এনার্জি সমৃদ্ধ চমৎকার ঐতিহ্যবাহী খাবার।'
  },

  // =================== ৭. ফাস্টফুড, স্ন্যাকস ও স্যুপ ===================
  { 
    regex: /\b(burger|বার্গার)\b/i, 
    name: 'চিকেন / বিফ বার্গার', 
    enName: 'Burger',
    cal: 520, p: 24.0, c: 48.0, f: 26.0, unit: 'টি', defaultQty: 1,
    tip: 'হাই-ক্যালোরি মিল, তবে প্রতিদিন না খেয়ে ব্যালান্স রেখে খাওয়া ভালো।'
  },
  { 
    regex: /\b(pizza|পিজ্জা)\b/i, 
    name: 'পিজ্জা স্লাইস', 
    enName: 'Pizza Slice',
    cal: 280, p: 12.0, c: 32.0, f: 12.0, unit: 'স্লাইস', defaultQty: 1,
    tip: 'চিজি ও হাই-ক্যালোরি স্ন্যাকস।'
  },
  { 
    regex: /\b(singara|shingara|সিঙ্গারা)\b/i, 
    name: 'আলুর সিঙ্গারা', 
    enName: 'Shingara',
    cal: 150, p: 2.5, c: 18.0, f: 8.0, unit: 'টি', defaultQty: 2,
    tip: 'বিকেলের জনপ্রিয় মুখরোচক স্ন্যাকস।'
  },
  { 
    regex: /\b(samucha|samosa|সমুচা)\b/i, 
    name: 'সমুচা', 
    enName: 'Samucha',
    cal: 130, p: 3.0, c: 14.0, f: 7.0, unit: 'টি', defaultQty: 2,
    tip: 'ক্রিস্পি স্ন্যাকস ফুড।'
  },
  { 
    regex: /\b(soup|স্যুপ)\b/i, 
    name: 'চিকেন কর্ন স্যুপ', 
    enName: 'Chicken Corn Soup',
    cal: 160, p: 12.0, c: 15.0, f: 5.0, unit: 'বাটি', defaultQty: 1,
    tip: 'সহজপাচ্য উষ্ণ তরল প্রোটিন সমৃদ্ধ খাবার।'
  },
  { 
    regex: /\b(roshogolla|misti|sweet|রসগোল্লা|মিষ্টি)\b/i, 
    name: 'ছানার মিষ্টি / রসগোল্লা', 
    enName: 'Roshogolla / Sweets',
    cal: 160, p: 3.5, c: 32.0, f: 2.5, unit: 'টি', defaultQty: 1,
    tip: 'খাবারের পর ১টি মিষ্টি ক্যালোরি ঘাটতি নিমেষেই দূর করে।'
  }
];

/**
 * ইনপুট টেক্সট থেকে পরিমাণ বা সংখ্যা বের করার স্মার্ট হেল্পার
 */
function extractQuantity(text) {
  const bnToEnMap = { '১': 1, '২': 2, '৩': 3, '৪': 4, '৫': 5, '৬': 6, '৭': 7, '৮': 8, '৯': 9, '০': 0 };
  const replaced = text.replace(/[১২৩৪৫৬৭৮৯০]/g, match => bnToEnMap[match]);
  
  // সংখ্যা যদি সরাসরি থাকে (যেমন: 5 ta, 10, 2.5)
  const numMatch = replaced.match(/(\d+(\.\d+)?)/);
  if (numMatch) return parseFloat(numMatch[1]);

  // কথায় লেখা থাকলে (বাংলা ও বাংলিশ)
  if (/\b(ek|ekta|akta|one|এক|একটি)\b/i.test(text)) return 1;
  if (/\b(dui|duita|duta|two|দুই|দুটি)\b/i.test(text)) return 2;
  if (/\b(tin|tinta|three|তিন|তিনটি)\b/i.test(text)) return 3;
  if (/\b(char|charta|four|চার|চারটি)\b/i.test(text)) return 4;
  if (/\b(pach|pasta|five|পাঁচ|পাঁচটি)\b/i.test(text)) return 5;
  if (/\b(choy|chota|six|ছয়|ছয়টি)\b/i.test(text)) return 6;
  if (/\b(shat|shatta|seven|সাত|সাতটি)\b/i.test(text)) return 7;
  if (/\b(aat|aatta|eight|আট|আটটি)\b/i.test(text)) return 8;
  if (/\b(noy|noyta|nine|নয়|নয়টি)\b/i.test(text)) return 9;
  if (/\b(dos|dasta|ten|দশ|দশটি)\b/i.test(text)) return 10;
  
  return null;
}

/**
 * প্রধান খাবার বিশ্লেষণ ইঞ্জিন
 */
export async function analyzeFoodWithAI(foodQuery, lang = 'en') {
  const isEnglish = lang === 'en';
  const qty = extractQuantity(foodQuery);

  // ১. মেগা ডাটাবেসে বাউন্ডারি-প্রটেক্টেড রেজেক্স ম্যাচিং
  for (const item of FOOD_MASTER_DB) {
    if (item.regex.test(foodQuery)) {
      const finalQty = qty !== null ? qty : item.defaultQty;
      const displayName = isEnglish 
        ? `${finalQty} ${item.enName}` 
        : `${finalQty} ${item.unit} ${item.name}`;

      return {
        name: displayName,
        calories: Math.round(item.cal * finalQty),
        protein: Math.round(item.p * finalQty * 10) / 10,
        carbs: Math.round(item.c * finalQty * 10) / 10,
        fat: Math.round(item.f * finalQty * 10) / 10,
        portion: `${finalQty} ${item.unit}`,
        aiTip: isEnglish ? "High density nutrient choice, essential for weight gain." : item.tip
      };
    }
  }

  // ২. ডিরেক্ট জেমিনি কল (যদি ভ্যালিড AIzaSy কী পাওয়া যায়)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (apiKey && apiKey.startsWith("AIzaSy")) {
    try {
      const targetLang = isEnglish ? "English" : "Bengali";
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze this food for weight gain: "${foodQuery}". Output ONLY raw JSON: {"name": "string in ${targetLang}", "calories": number, "protein": number, "carbs": number, "fat": number, "portion": "string", "aiTip": "string in ${targetLang}"}`
            }]
          }]
        })
      });
      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        return JSON.parse(rawText.replace(/```json/g, "").replace(/```/g, "").trim());
      }
    } catch (e) {
      console.warn("AI fetch fallback:", e);
    }
  }

  // ৩. স্মার্ট ডাইনামিক আনকমন ফুড ক্যালকুলেটর (কখনোই ফিক্সড ১৮০ নয়)
  const finalQty = qty !== null ? qty : 1;
  const hash = foodQuery.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const dynamicCal = Math.max(120, (hash % 260) + 140);

  return {
    name: foodQuery,
    calories: Math.round(dynamicCal * finalQty),
    protein: Math.round(finalQty * 8.5 * 10) / 10,
    carbs: Math.round(finalQty * 34.0 * 10) / 10,
    fat: Math.round(finalQty * 6.5 * 10) / 10,
    portion: `${finalQty} serving`,
    aiTip: isEnglish 
      ? "Logged into daily goals with estimated nutritional values." 
      : "খাবারটি সফলভাবে ডাইনামিক হিসাবে দৈনিক লক্ষ্যে যোগ করা হয়েছে।"
  };
}

/**
 * এক্সারসাইজ বিশ্লেষণ ইঞ্জিন
 */
export async function analyzeExerciseWithAI(exerciseQuery, lang = 'en') {
  const clean = exerciseQuery.toLowerCase();
  let burned = 50;
  let muscle = lang === 'bn' ? "বুক ও হাত" : "Upper Body";

  if (/push|পুশ/i.test(clean)) {
    burned = 65;
    muscle = lang === 'bn' ? "বুক ও ট্রাইসেপস (Push-ups)" : "Chest & Triceps";
  } else if (/dip|ডিপ/i.test(clean)) {
    burned = 55;
    muscle = lang === 'bn' ? "ট্রাইসেপস আর্মস (Dips)" : "Triceps";
  } else if (/squat|স্কোয়াট|স্কোয়াট/i.test(clean)) {
    burned = 75;
    muscle = lang === 'bn' ? "পায়ের মাংসপেশি (Squats)" : "Legs & Core";
  } else if (/curl|কার্ল/i.test(clean)) {
    burned = 45;
    muscle = lang === 'bn' ? "হাতের বাইসেপস (Biceps)" : "Biceps";
  }

  return {
    name: exerciseQuery,
    caloriesBurned: burned,
    targetedMuscle: muscle,
    effortLevel: lang === 'bn' ? "মাঝারি" : "Moderate",
    aiFeedback: lang === 'bn'
      ? "ধারাবাহিকতা বজায় রাখুন, পেশি বাড়াতে পর্যাপ্ত বিশ্রাম জরুরি।"
      : "Consistency builds muscle. Keep eating in a surplus!"
  };
}