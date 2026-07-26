// ============================================================
// Health Awareness Studio — content + calendar engine (foundation)
// Standalone + Node-testable. Later spliced into the candidate HTML.
// ============================================================

// ---- Movable-date engine (year-aware) ----
function nthWeekdayOfMonth(year, month, weekday, occurrence) {
  // month 1-12, weekday 0=Sun..6=Sat, occurrence 1..5
  const first = new Date(Date.UTC(year, month - 1, 1));
  const firstDow = first.getUTCDay();
  let day = 1 + ((weekday - firstDow + 7) % 7) + (occurrence - 1) * 7;
  const dim = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day > dim) return null;
  return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}
function lastWeekdayOfMonth(year, month, weekday) {
  const dim = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const last = new Date(Date.UTC(year, month - 1, dim));
  const lastDow = last.getUTCDay();
  const day = dim - ((lastDow - weekday + 7) % 7);
  return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

// ---- Slug helper ----
function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// ---- Content library (BATCH 1: 40 studio health themes) ----
// Each topic: complete, topic-specific, bilingual. No English-as-Gujarati fallback.
const TOPIC_CONTENT = {
  'balanced-diet': {
    title_en:'Balanced Diet Awareness Day', title_gu:'સંતુલિત આહાર જાગૃતિ દિવસ',
    importance_en:'A balanced diet supplies the energy and nutrients the body needs and lowers the risk of many diseases.',
    importance_gu:'સંતુલિત આહાર શરીરને જરૂરી ઊર્જા અને પોષક તત્વો આપે છે અને અનેક રોગોનું જોખમ ઘટાડે છે.',
    points_en:['Fill half your plate with fruit and vegetables','Choose whole grains over refined ones','Limit sugar, salt and fried food','Drink water instead of sugary drinks'],
    points_gu:['અડધી થાળી ફળ અને શાકભાજીથી ભરો','રિફાઇન્ડને બદલે આખા અનાજ પસંદ કરો','ખાંડ, મીઠું અને તળેલું મર્યાદિત કરો','ખાંડવાળા પીણાંને બદલે પાણી પીઓ'],
    cta_en:'Eat a colourful, balanced plate every day.', cta_gu:'દરરોજ રંગબેરંગી, સંતુલિત થાળી ખાઓ.',
    hashtags:['BalancedDiet','HealthyEating','Nutrition'], icon:'apple', category:'Health & Nutrition'
  },
  'daily-walking': {
    title_en:'Daily Walking Awareness Day', title_gu:'દૈનિક ચાલવાની જાગૃતિ દિવસ',
    importance_en:'Walking every day strengthens the heart, controls weight and improves mood without any equipment.',
    importance_gu:'દરરોજ ચાલવાથી હૃદય મજબૂત થાય છે, વજન નિયંત્રિત રહે છે અને મન પ્રસન્ન રહે છે — કોઈ સાધન વગર.',
    points_en:['Aim for 30 minutes of brisk walking','Take the stairs instead of the lift','Walk after meals to aid digestion','Invite a friend to stay motivated'],
    points_gu:['30 મિનિટ ઝડપી ચાલવાનું લક્ષ્ય રાખો','લિફ્ટને બદલે સીડીનો ઉપયોગ કરો','પાચન માટે ભોજન પછી ચાલો','પ્રેરિત રહેવા મિત્રને સાથે લો'],
    cta_en:'Step out and walk 30 minutes today.', cta_gu:'આજે બહાર નીકળી 30 મિનિટ ચાલો.',
    hashtags:['WalkDaily','StayActive','FitnessForAll'], icon:'walk', category:'Physical Activity'
  },
  'safe-drinking-water': {
    title_en:'Safe Drinking Water Awareness Day', title_gu:'સુરક્ષિત પીવાના પાણી જાગૃતિ દિવસ',
    importance_en:'Clean drinking water prevents diarrhoea, typhoid and many water-borne infections.',
    importance_gu:'સ્વચ્છ પીવાનું પાણી ઝાડા, ટાઇફોઇડ અને અનેક જળજન્ય ચેપ અટકાવે છે.',
    points_en:['Boil or filter water when unsure','Store water in clean, covered containers','Keep drinking water away from waste','Wash hands before handling water'],
    points_gu:['શંકા હોય તો પાણી ઉકાળો કે ગાળો','પાણી સ્વચ્છ, ઢાંકેલા વાસણમાં રાખો','પીવાનું પાણી કચરાથી દૂર રાખો','પાણી લેતાં પહેલાં હાથ ધોવો'],
    cta_en:'Store and drink only clean, safe water.', cta_gu:'ફક્ત સ્વચ્છ, સુરક્ષિત પાણી સંગ્રહો અને પીઓ.',
    hashtags:['SafeWater','CleanWater','WaterIsLife'], icon:'water', category:'Public Health'
  },
  'sleep-health': {
    title_en:'Sleep Health Awareness Day', title_gu:'ઊંઘ આરોગ્ય જાગૃતિ દિવસ',
    importance_en:'Good sleep restores the body and mind and supports memory, mood and immunity.',
    importance_gu:'સારી ઊંઘ શરીર અને મનને પુનઃસ્થાપિત કરે છે અને યાદશક્તિ, મન અને રોગપ્રતિકારક શક્તિ મજબૂત કરે છે.',
    points_en:['Keep a fixed sleep and wake time','Avoid screens an hour before bed','Limit caffeine in the evening','Keep the bedroom dark and quiet'],
    points_gu:['સૂવા-જાગવાનો નિશ્ચિત સમય રાખો','સૂતાં એક કલાક પહેલાં સ્ક્રીન ટાળો','સાંજે કેફીન મર્યાદિત કરો','શયનખંડ અંધારો અને શાંત રાખો'],
    cta_en:'Protect 7–8 hours of restful sleep tonight.', cta_gu:'આજ રાત્રે 7–8 કલાકની આરામદાયક ઊંઘ સુનિશ્ચિત કરો.',
    hashtags:['SleepHealth','RestWell','Wellbeing'], icon:'brain', category:'Mental & Physical Health'
  },
  'oral-hygiene': {
    title_en:'Oral Hygiene Awareness Day', title_gu:'મૌખિક સ્વચ્છતા જાગૃતિ દિવસ',
    importance_en:'Healthy teeth and gums prevent pain, infection and are linked to overall health.',
    importance_gu:'સ્વસ્થ દાંત અને પેઢાં દુખાવો અને ચેપ અટકાવે છે અને સમગ્ર આરોગ્ય સાથે જોડાયેલા છે.',
    points_en:['Brush twice a day with fluoride toothpaste','Clean between teeth daily','Cut down on sugary snacks','See a dentist regularly'],
    points_gu:['ફ્લોરાઇડ ટૂથપેસ્ટથી દિવસમાં બે વાર બ્રશ કરો','દરરોજ દાંત વચ્ચે સફાઈ કરો','ખાંડવાળા નાસ્તા ઘટાડો','નિયમિત દંત ચિકિત્સકને મળો'],
    cta_en:'Brush twice daily and keep your smile healthy.', cta_gu:'દિવસમાં બે વાર બ્રશ કરો અને તમારું સ્મિત સ્વસ્થ રાખો.',
    hashtags:['OralHealth','HealthySmile','DentalCare'], icon:'heart', category:'Health'
  },
  'handwashing': {
    title_en:'Handwashing Practice Day', title_gu:'હાથ ધોવાની પ્રેક્ટિસ દિવસ',
    importance_en:'Washing hands with soap removes germs and is one of the cheapest ways to prevent infection.',
    importance_gu:'સાબુથી હાથ ધોવાથી જંતુઓ દૂર થાય છે અને ચેપ અટકાવવાનો આ સૌથી સસ્તો ઉપાય છે.',
    points_en:['Wash for at least 20 seconds with soap','Clean before eating and after the toilet','Scrub palms, backs, between fingers and nails','Use clean water to rinse'],
    points_gu:['સાબુથી ઓછામાં ઓછી 20 સેકન્ડ ધોવો','જમતાં પહેલાં અને શૌચાલય પછી ધોવો','હથેળી, પાછળ, આંગળી વચ્ચે અને નખ ઘસો','સ્વચ્છ પાણીથી ધોઈ કાઢો'],
    cta_en:'Wash hands with soap at key moments today.', cta_gu:'આજે મહત્વના સમયે સાબુથી હાથ ધોવો.',
    hashtags:['HandHygiene','WashYourHands','StaySafe'], icon:'shield', category:'Public Health'
  },
  'healthy-heart': {
    title_en:'Healthy Heart Habits Day', title_gu:'સ્વસ્થ હૃદય આદત દિવસ',
    importance_en:'Simple daily habits protect the heart and lower the risk of heart attack and stroke.',
    importance_gu:'સરળ દૈનિક આદતો હૃદયનું રક્ષણ કરે છે અને હાર્ટ એટેક તથા સ્ટ્રોકનું જોખમ ઘટાડે છે.',
    points_en:['Be active for 30 minutes most days','Eat less salt and fried food','Avoid tobacco and limit alcohol','Check blood pressure and cholesterol'],
    points_gu:['મોટાભાગના દિવસો 30 મિનિટ સક્રિય રહો','ઓછું મીઠું અને તળેલું ખાઓ','તમાકુ ટાળો અને દારૂ મર્યાદિત કરો','બ્લડપ્રેશર અને કોલેસ્ટ્રોલ તપાસો'],
    cta_en:'Care for your heart with active, low-salt living.', cta_gu:'સક્રિય, ઓછા-મીઠાવાળા જીવનથી હૃદયની સંભાળ લો.',
    hashtags:['HeartHealth','HealthyHeart','LoveYourHeart'], icon:'heart', category:'Health'
  },
  'diabetes-prevention': {
    title_en:'Diabetes Prevention Awareness Day', title_gu:'ડાયાબિટીસ નિવારણ જાગૃતિ દિવસ',
    importance_en:'Type 2 diabetes can often be delayed or prevented through weight, diet and activity.',
    importance_gu:'ટાઇપ 2 ડાયાબિટીસ ઘણી વાર વજન, આહાર અને પ્રવૃત્તિ દ્વારા ટાળી કે વિલંબિત કરી શકાય છે.',
    points_en:['Maintain a healthy weight','Cut sugary drinks and sweets','Stay physically active daily','Get blood sugar checked if at risk'],
    points_gu:['સ્વસ્થ વજન જાળવો','ખાંડવાળા પીણાં અને મીઠાઈ ઘટાડો','દરરોજ શારીરિક રીતે સક્રિય રહો','જોખમ હોય તો બ્લડ સુગર તપાસાવો'],
    cta_en:'Prevent diabetes — move more, eat less sugar.', cta_gu:'ડાયાબિટીસ અટકાવો — વધુ ચાલો, ઓછી ખાંડ ખાઓ.',
    hashtags:['BeatDiabetes','DiabetesPrevention','HealthyLiving'], icon:'apple', category:'Health'
  },
  'blood-pressure-check': {
    title_en:'Blood Pressure Check Awareness Day', title_gu:'બ્લડપ્રેશર તપાસ જાગૃતિ દિવસ',
    importance_en:'High blood pressure often has no symptoms yet raises the risk of stroke and heart disease; regular checks help.',
    importance_gu:'હાઈ બ્લડપ્રેશરના ઘણી વાર કોઈ લક્ષણ હોતાં નથી છતાં તે સ્ટ્રોક અને હૃદયરોગનું જોખમ વધારે છે; નિયમિત તપાસ મદદરૂપ છે.',
    points_en:['Get your blood pressure measured regularly','Reduce salt in your meals','Stay active and manage stress','Take prescribed medicines as advised'],
    points_gu:['તમારું બ્લડપ્રેશર નિયમિત માપાવો','ભોજનમાં મીઠું ઘટાડો','સક્રિય રહો અને તણાવ સંભાળો','સૂચવેલ દવાઓ સલાહ મુજબ લો'],
    cta_en:'Know your numbers — check your blood pressure.', cta_gu:'તમારા આંકડા જાણો — બ્લડપ્રેશર તપાસાવો.',
    hashtags:['KnowYourNumbers','BloodPressure','HeartHealth'], icon:'heart', category:'Health'
  },
  'cancer-prevention': {
    title_en:'Cancer Prevention Awareness Day', title_gu:'કેન્સર નિવારણ જાગૃતિ દિવસ',
    importance_en:'Many cancers can be prevented or caught early through healthy habits and screening.',
    importance_gu:'સ્વસ્થ આદતો અને સ્ક્રીનિંગ દ્વારા અનેક કેન્સર અટકાવી કે વહેલાં પકડી શકાય છે.',
    points_en:['Avoid tobacco in every form','Eat more fruit, vegetables and fibre','Stay active and keep a healthy weight','Attend recommended cancer screenings'],
    points_gu:['દરેક સ્વરૂપમાં તમાકુ ટાળો','વધુ ફળ, શાકભાજી અને ફાઇબર ખાઓ','સક્રિય રહો અને સ્વસ્થ વજન જાળવો','ભલામણ કરેલ કેન્સર સ્ક્રીનિંગ કરાવો'],
    cta_en:'Lower your cancer risk — screen early, live healthy.', cta_gu:'કેન્સરનું જોખમ ઘટાડો — વહેલી સ્ક્રીનિંગ કરાવો, સ્વસ્થ જીવો.',
    hashtags:['CancerPrevention','ScreenEarly','HealthyLiving'], icon:'shield', category:'Health'
  },
  'tobacco-free': {
    title_en:'Tobacco-Free Living Day', title_gu:'તમાકુમુક્ત જીવન દિવસ',
    importance_en:'Tobacco harms nearly every organ; quitting at any age brings quick and lasting benefits.',
    importance_gu:'તમાકુ લગભગ દરેક અંગને નુકસાન કરે છે; કોઈ પણ ઉંમરે છોડવાથી ઝડપી અને કાયમી લાભ મળે છે.',
    points_en:['Set a quit date and tell your family','Avoid triggers and tobacco company','Seek counselling or a quit helpline','Replace the habit with a healthy activity'],
    points_gu:['છોડવાની તારીખ નક્કી કરો અને પરિવારને જણાવો','ટ્રિગર અને તમાકુની સંગત ટાળો','સલાહ કે ક્વિટ હેલ્પલાઇન લો','આદતને સ્વસ્થ પ્રવૃત્તિથી બદલો'],
    cta_en:'Choose a tobacco-free life — start quitting today.', cta_gu:'તમાકુમુક્ત જીવન પસંદ કરો — આજથી છોડવાનું શરૂ કરો.',
    hashtags:['QuitTobacco','TobaccoFree','SayNoToTobacco'], icon:'shield', category:'Health'
  },
  'mental-wellbeing': {
    title_en:'Mental Well-being Awareness Day', title_gu:'માનસિક સુખાકારી જાગૃતિ દિવસ',
    importance_en:'Mental health matters as much as physical health; support and small habits help us cope.',
    importance_gu:'માનસિક આરોગ્ય શારીરિક આરોગ્ય જેટલું જ મહત્વનું છે; સહારો અને નાની આદતો સામનો કરવામાં મદદ કરે છે.',
    points_en:['Talk openly about your feelings','Stay connected with people you trust','Sleep, move and eat well','Seek help early when distressed'],
    points_gu:['તમારી લાગણીઓ વિશે ખુલ્લેઆમ વાત કરો','વિશ્વાસુ લોકો સાથે જોડાયેલા રહો','સારી ઊંઘ લો, ચાલો અને સારું ખાઓ','તકલીફમાં વહેલી મદદ લો'],
    cta_en:'Mind your mind — reach out and take care.', cta_gu:'તમારા મનની કાળજી લો — વાત કરો અને સંભાળ રાખો.',
    hashtags:['MentalHealth','ItsOkayToTalk','Wellbeing'], icon:'brain', category:'Mental Health'
  },
  'maternal-health': {
    title_en:'Maternal Health Awareness Day', title_gu:'માતૃ આરોગ્ય જાગૃતિ દિવસ',
    importance_en:'Good care before, during and after pregnancy keeps mothers and babies safe.',
    importance_gu:'ગર્ભાવસ્થા પહેલાં, દરમિયાન અને પછીની સારી સંભાળ માતા અને બાળકને સુરક્ષિત રાખે છે.',
    points_en:['Attend all antenatal check-ups','Eat iron- and folate-rich foods','Watch for danger signs and act fast','Plan a safe, assisted delivery'],
    points_gu:['બધી પ્રસૂતિ-પૂર્વ તપાસમાં હાજર રહો','આયર્ન અને ફોલેટયુક્ત ખોરાક લો','ભયના ચિહ્નો પર ધ્યાન રાખો અને ઝડપથી પગલાં લો','સુરક્ષિત, સહાયિત પ્રસૂતિનું આયોજન કરો'],
    cta_en:'Support every mother with safe, timely care.', cta_gu:'દરેક માતાને સુરક્ષિત, સમયસર સંભાળ આપો.',
    hashtags:['MaternalHealth','SafeMotherhood','HealthyMothers'], icon:'mom', category:'Reproductive & Maternal Health'
  },
  'child-nutrition': {
    title_en:'Child Nutrition Awareness Day', title_gu:'બાળ પોષણ જાગૃતિ દિવસ',
    importance_en:'Good nutrition in childhood supports growth, learning and lifelong health.',
    importance_gu:'બાળપણમાં સારું પોષણ વૃદ્ધિ, શિક્ષણ અને જીવનભરના આરોગ્યને ટેકો આપે છે.',
    points_en:['Breastfeed exclusively for six months','Give varied, home-cooked meals','Include fruit, vegetables and pulses','Keep up the childhood vaccination schedule'],
    points_gu:['છ મહિના સુધી ફક્ત સ્તનપાન કરાવો','વૈવિધ્યસભર, ઘરે બનાવેલ ભોજન આપો','ફળ, શાકભાજી અને કઠોળ સામેલ કરો','બાળ રસીકરણ સમયપત્રક જાળવો'],
    cta_en:'Feed children well for a strong start.', cta_gu:'મજબૂત શરૂઆત માટે બાળકોને સારું પોષણ આપો.',
    hashtags:['ChildNutrition','HealthyKids','NourishToFlourish'], icon:'child', category:'Child Health'
  },
  'adolescent-health': {
    title_en:'Adolescent Health Awareness Day', title_gu:'કિશોર આરોગ્ય જાગૃતિ દિવસ',
    importance_en:'Teenage years shape lifelong habits; support helps young people grow up healthy.',
    importance_gu:'કિશોરાવસ્થા જીવનભરની આદતો ઘડે છે; સહારો યુવાનોને સ્વસ્થ થવામાં મદદ કરે છે.',
    points_en:['Eat balanced meals and stay active','Avoid tobacco, alcohol and drugs','Talk about stress and emotions','Sleep enough and limit screen time'],
    points_gu:['સંતુલિત ભોજન લો અને સક્રિય રહો','તમાકુ, દારૂ અને નશો ટાળો','તણાવ અને લાગણીઓ વિશે વાત કરો','પૂરતી ઊંઘ લો અને સ્ક્રીન સમય મર્યાદિત કરો'],
    cta_en:'Empower teens to make healthy choices.', cta_gu:'કિશોરોને સ્વસ્થ પસંદગી કરવા સક્ષમ બનાવો.',
    hashtags:['TeenHealth','AdolescentHealth','HealthyYouth'], icon:'teen', category:'Adolescent Health'
  },
  'senior-wellness': {
    title_en:'Senior Citizen Wellness Day', title_gu:'વરિષ્ઠ નાગરિક સુખાકારી દિવસ',
    importance_en:'With the right care older adults can stay active, independent and connected.',
    importance_gu:'યોગ્ય સંભાળ સાથે વૃદ્ધ વ્યક્તિઓ સક્રિય, સ્વતંત્ર અને જોડાયેલા રહી શકે છે.',
    points_en:['Stay gently active every day','Eat protein and calcium-rich foods','Prevent falls at home','Keep regular health check-ups'],
    points_gu:['દરરોજ હળવી રીતે સક્રિય રહો','પ્રોટીન અને કેલ્શિયમયુક્ત ખોરાક લો','ઘરમાં પડી જવાથી બચાવ કરો','નિયમિત આરોગ્ય તપાસ જાળવો'],
    cta_en:'Help elders live active, dignified lives.', cta_gu:'વડીલોને સક્રિય, ગૌરવપૂર્ણ જીવન જીવવામાં મદદ કરો.',
    hashtags:['HealthyAgeing','SeniorCare','ActiveAgeing'], icon:'elder', category:'Healthy Ageing'
  },
  'road-safety': {
    title_en:'Road Safety Awareness Day', title_gu:'માર્ગ સલામતી જાગૃતિ દિવસ',
    importance_en:'Most road crashes are preventable with safe behaviour by drivers and pedestrians.',
    importance_gu:'મોટાભાગના માર્ગ અકસ્માતો ડ્રાઇવર અને રાહદારીઓની સલામત વર્તણૂકથી ટાળી શકાય છે.',
    points_en:['Always wear a helmet or seat belt','Never use a phone while driving','Follow speed limits and signals','Never drive after drinking'],
    points_gu:['હંમેશા હેલ્મેટ કે સીટ બેલ્ટ પહેરો','વાહન ચલાવતી વખતે ફોન ન વાપરો','ગતિ મર્યાદા અને સિગ્નલનું પાલન કરો','દારૂ પીધા પછી ક્યારેય વાહન ન ચલાવો'],
    cta_en:'Drive safe, arrive safe — follow the rules.', cta_gu:'સલામત ચલાવો, સલામત પહોંચો — નિયમોનું પાલન કરો.',
    hashtags:['RoadSafety','WearHelmet','SafeDriving'], icon:'shield', category:'Safety & Injury Prevention'
  },
  'mosquito-borne-prevention': {
    title_en:'Mosquito-Borne Disease Prevention Day', title_gu:'મચ્છરજન્ય રોગ નિવારણ દિવસ',
    importance_en:'Mosquitoes spread dengue, malaria and chikungunya; removing breeding sites protects everyone.',
    importance_gu:'મચ્છર ડેંગ્યુ, મેલેરિયા અને ચિકનગુનિયા ફેલાવે છે; પ્રજનન સ્થળો દૂર કરવાથી બધાનું રક્ષણ થાય છે.',
    points_en:['Empty water from pots, coolers and tyres weekly','Use nets, screens and repellent','Wear full-sleeved clothing at dusk','Report fever with rash early'],
    points_gu:['વાસણ, કૂલર અને ટાયરમાંથી અઠવાડિક પાણી ખાલી કરો','જાળી, સ્ક્રીન અને રિપેલન્ટ વાપરો','સાંજે લાંબી બાંયના કપડાં પહેરો','તાવ સાથે ચકામા હોય તો વહેલી જાણ કરો'],
    cta_en:'Beat mosquitoes — no standing water, no bites.', cta_gu:'મચ્છરોને હરાવો — ઉભું પાણી નહીં, ડંખ નહીં.',
    hashtags:['BeatMosquitoes','VectorControl','DengueFree'], icon:'mosquito', category:'Vector-Borne Disease'
  },
  'dengue-prevention': {
    title_en:'Dengue Prevention Awareness Day', title_gu:'ડેંગ્યુ નિવારણ જાગૃતિ દિવસ',
    importance_en:'Dengue spreads through day-biting mosquitoes that breed in clean, still water near homes.',
    importance_gu:'ડેંગ્યુ દિવસે કરડતા મચ્છરોથી ફેલાય છે જે ઘર નજીકના સ્વચ્છ, સ્થિર પાણીમાં ઉછરે છે.',
    points_en:['Empty and scrub water containers weekly','Cover stored water tightly','Use repellent and wear covering clothes','See a doctor for high fever and body pain'],
    points_gu:['દર અઠવાડિયે પાણીના વાસણ ખાલી કરી ઘસો','સંગ્રહેલું પાણી ચુસ્ત ઢાંકો','રિપેલન્ટ વાપરો અને ઢાંકતા કપડાં પહેરો','તીવ્ર તાવ અને શરીર દુખાવે ડૉક્ટરને મળો'],
    cta_en:'Stop dengue at the source — clear still water.', cta_gu:'સ્રોત પર ડેંગ્યુ અટકાવો — સ્થિર પાણી દૂર કરો.',
    hashtags:['DengueFree','StopDengue','FightTheBite'], icon:'mosquito', category:'Vector-Borne Disease'
  },
  'malaria-prevention': {
    title_en:'Malaria Prevention Awareness Day', title_gu:'મેલેરિયા નિવારણ જાગૃતિ દિવસ',
    importance_en:'Malaria is preventable and curable; nets and early treatment save lives.',
    importance_gu:'મેલેરિયા અટકાવી અને સાજો કરી શકાય છે; મચ્છરદાની અને વહેલી સારવાર જીવન બચાવે છે.',
    points_en:['Sleep under an insecticide-treated net','Clear stagnant water around the home','Seek testing for any fever with chills','Complete the full course of treatment'],
    points_gu:['જંતુનાશકયુક્ત મચ્છરદાની હેઠળ સૂઓ','ઘરની આસપાસનું સ્થિર પાણી દૂર કરો','ટાઢ સાથે તાવ હોય તો તપાસ કરાવો','સારવારનો પૂરો કોર્સ પૂર્ણ કરો'],
    cta_en:'Fight malaria — sleep under a net, test early.', cta_gu:'મેલેરિયા સામે લડો — મચ્છરદાનીમાં સૂઓ, વહેલી તપાસ કરાવો.',
    hashtags:['EndMalaria','MalariaPrevention','ZeroMalaria'], icon:'mosquito', category:'Vector-Borne Disease'
  },
  'tb-prevention': {
    title_en:'Tuberculosis Prevention Awareness Day', title_gu:'ક્ષય રોગ નિવારણ જાગૃતિ દિવસ',
    importance_en:'TB spreads through the air but is curable with early diagnosis and complete treatment.',
    importance_gu:'ટીબી હવા દ્વારા ફેલાય છે પણ વહેલા નિદાન અને પૂર્ણ સારવારથી સાજો થાય છે.',
    points_en:['Get a cough lasting over two weeks checked','Cover your mouth when coughing','Ensure good ventilation indoors','Complete the full TB treatment course'],
    points_gu:['બે અઠવાડિયાથી વધુ ખાંસી હોય તો તપાસ કરાવો','ખાંસતી વખતે મોં ઢાંકો','ઘરમાં સારી હવાની અવરજવર રાખો','ટીબીની સારવારનો પૂરો કોર્સ પૂર્ણ કરો'],
    cta_en:'End TB — test early and complete treatment.', cta_gu:'ટીબી નાબૂદ કરો — વહેલી તપાસ અને પૂર્ણ સારવાર કરો.',
    hashtags:['EndTB','TBHaaregaDeshJeetega','StopTB'], icon:'virus', category:'Communicable Disease'
  },
  'vaccination': {
    title_en:'Vaccination Awareness Day', title_gu:'રસીકરણ જાગૃતિ દિવસ',
    importance_en:'Vaccines protect against serious diseases and keep whole communities safe.',
    importance_gu:'રસી ગંભીર રોગો સામે રક્ષણ આપે છે અને સમગ્ર સમુદાયને સુરક્ષિત રાખે છે.',
    points_en:['Follow the childhood immunisation schedule','Keep vaccination records safe','Ask about booster doses when due','Encourage others to get vaccinated'],
    points_gu:['બાળ રસીકરણ સમયપત્રકનું પાલન કરો','રસીકરણ રેકોર્ડ સુરક્ષિત રાખો','બૂસ્ટર ડોઝ વિશે સમયસર પૂછો','અન્યને રસી લેવા પ્રોત્સાહિત કરો'],
    cta_en:'Stay up to date — vaccinate on time.', cta_gu:'સમયસર રહો — સમયસર રસી લો.',
    hashtags:['GetVaccinated','Immunisation','VaccinesWork'], icon:'syringe', category:'Immunization'
  },
  'anaemia-prevention': {
    title_en:'Anaemia Prevention Awareness Day', title_gu:'એનિમિયા નિવારણ જાગૃતિ દિવસ',
    importance_en:'Iron-deficiency anaemia causes tiredness and weakness but is easy to prevent with diet.',
    importance_gu:'આયર્નની ઉણપથી થતો એનિમિયા થાક અને નબળાઈ લાવે છે પણ આહારથી સરળતાથી અટકાવી શકાય છે.',
    points_en:['Eat green leafy vegetables and pulses','Add vitamin-C foods to boost iron uptake','Take iron-folic acid as advised','Get tested if you feel very tired'],
    points_gu:['લીલા પાંદડાવાળા શાકભાજી અને કઠોળ ખાઓ','આયર્ન શોષણ વધારવા વિટામિન-સી ખોરાક ઉમેરો','સલાહ મુજબ આયર્ન-ફોલિક એસિડ લો','ખૂબ થાક લાગે તો તપાસ કરાવો'],
    cta_en:'Beat anaemia — eat iron-rich foods.', cta_gu:'એનિમિયાને હરાવો — આયર્નયુક્ત ખોરાક ખાઓ.',
    hashtags:['AnaemiaFree','IronRich','HealthyBlood'], icon:'apple', category:'Nutrition'
  },
  'womens-health': {
    title_en:"Women's Health Awareness Day", title_gu:'મહિલા આરોગ્ય જાગૃતિ દિવસ',
    importance_en:'Regular care and screening help women stay healthy at every stage of life.',
    importance_gu:'નિયમિત સંભાળ અને સ્ક્રીનિંગ મહિલાઓને જીવનના દરેક તબક્કે સ્વસ્થ રહેવામાં મદદ કરે છે.',
    points_en:['Attend regular health screenings','Eat iron- and calcium-rich foods','Stay active and manage stress','Never ignore unusual symptoms'],
    points_gu:['નિયમિત આરોગ્ય સ્ક્રીનિંગ કરાવો','આયર્ન અને કેલ્શિયમયુક્ત ખોરાક લો','સક્રિય રહો અને તણાવ સંભાળો','અસામાન્ય લક્ષણોને ક્યારેય અવગણશો નહીં'],
    cta_en:'Prioritise women’s health — screen and care.', cta_gu:'મહિલા આરોગ્યને પ્રાધાન્ય આપો — સ્ક્રીનિંગ અને સંભાળ કરો.',
    hashtags:['WomensHealth','HealthyWomen','CareForHer'], icon:'woman', category:"Women's Health"
  },
  'mens-health': {
    title_en:"Men's Health Awareness Day", title_gu:'પુરુષ આરોગ્ય જાગૃતિ દિવસ',
    importance_en:'Men often delay care; regular check-ups catch problems like blood pressure and diabetes early.',
    importance_gu:'પુરુષો ઘણી વાર સંભાળમાં વિલંબ કરે છે; નિયમિત તપાસ બ્લડપ્રેશર અને ડાયાબિટીસ જેવી સમસ્યાઓ વહેલી પકડે છે.',
    points_en:['Get regular health check-ups','Avoid tobacco and limit alcohol','Stay active and eat heart-healthy','Talk about stress and mental health'],
    points_gu:['નિયમિત આરોગ્ય તપાસ કરાવો','તમાકુ ટાળો અને દારૂ મર્યાદિત કરો','સક્રિય રહો અને હૃદય માટે સ્વસ્થ ખાઓ','તણાવ અને માનસિક આરોગ્ય વિશે વાત કરો'],
    cta_en:'Men, don’t delay — check your health today.', cta_gu:'પુરુષો, વિલંબ ન કરો — આજે તમારું આરોગ્ય તપાસો.',
    hashtags:['MensHealth','HealthyMen','CheckToday'], icon:'man', category:"Men's Health"
  },
  'eye-health': {
    title_en:'Eye Health Awareness Day', title_gu:'આંખ આરોગ્ય જાગૃતિ દિવસ',
    importance_en:'Regular eye care protects vision and detects problems like cataract and glaucoma early.',
    importance_gu:'નિયમિત આંખની સંભાળ દૃષ્ટિનું રક્ષણ કરે છે અને મોતિયા તથા ગ્લુકોમા જેવી સમસ્યાઓ વહેલી પકડે છે.',
    points_en:['Have your eyes tested regularly','Rest your eyes from screens often','Eat vitamin-A rich foods','Protect eyes from dust and strong sun'],
    points_gu:['તમારી આંખો નિયમિત તપાસાવો','સ્ક્રીનથી આંખોને વારંવાર આરામ આપો','વિટામિન-એ યુક્ત ખોરાક ખાઓ','ધૂળ અને તીવ્ર તડકાથી આંખોનું રક્ષણ કરો'],
    cta_en:'See clearly — get your eyes checked.', cta_gu:'સ્પષ્ટ જુઓ — તમારી આંખો તપાસાવો.',
    hashtags:['EyeHealth','VisionCare','HealthyEyes'], icon:'heart', category:'Health'
  },
  'hearing-health': {
    title_en:'Hearing Health Awareness Day', title_gu:'શ્રવણ આરોગ્ય જાગૃતિ દિવસ',
    importance_en:'Much hearing loss is preventable; protecting ears keeps communication and safety intact.',
    importance_gu:'મોટા ભાગની શ્રવણ ખોટ અટકાવી શકાય છે; કાનનું રક્ષણ સંચાર અને સલામતી જાળવે છે.',
    points_en:['Avoid very loud noise and music','Keep volume low on earphones','Never insert objects into the ear','Get hearing checked if it seems reduced'],
    points_gu:['ખૂબ મોટા અવાજ અને સંગીતથી બચો','ઇયરફોનનું વોલ્યુમ ઓછું રાખો','કાનમાં ક્યારેય વસ્તુ ન નાખો','શ્રવણ ઘટ્યું લાગે તો તપાસ કરાવો'],
    cta_en:'Protect your hearing — turn the volume down.', cta_gu:'તમારા શ્રવણનું રક્ષણ કરો — વોલ્યુમ ઓછું કરો.',
    hashtags:['HearingHealth','ProtectYourEars','SafeListening'], icon:'heart', category:'Health'
  },
  'kidney-health': {
    title_en:'Kidney Health Awareness Day', title_gu:'કિડની આરોગ્ય જાગૃતિ દિવસ',
    importance_en:'Kidneys filter waste and balance fluids; early detection prevents serious kidney disease.',
    importance_gu:'કિડની કચરો ગાળે છે અને પ્રવાહી સંતુલિત રાખે છે; વહેલી તપાસ ગંભીર કિડની રોગ અટકાવે છે.',
    points_en:['Drink enough water through the day','Control blood pressure and blood sugar','Limit salt and avoid needless painkillers','Get kidney function tested if at risk'],
    points_gu:['દિવસભર પૂરતું પાણી પીઓ','બ્લડપ્રેશર અને બ્લડ સુગર નિયંત્રિત રાખો','મીઠું મર્યાદિત કરો અને બિનજરૂરી પેઈનકિલર ટાળો','જોખમ હોય તો કિડની કાર્ય તપાસાવો'],
    cta_en:'Protect your kidneys — hydrate and control BP and sugar.', cta_gu:'તમારી કિડનીનું રક્ષણ કરો — પાણી પીઓ, બીપી અને શુગર નિયંત્રિત રાખો.',
    hashtags:['KidneyHealth','HealthyKidneys','CKDAwareness'], icon:'water', category:'Health'
  },
  'liver-health': {
    title_en:'Liver Health Awareness Day', title_gu:'લીવર આરોગ્ય જાગૃતિ દિવસ',
    importance_en:'The liver processes nutrients and toxins; healthy habits and hepatitis vaccination protect it.',
    importance_gu:'લીવર પોષક તત્વો અને ઝેરી પદાર્થોનું પ્રક્રિયન કરે છે; સ્વસ્થ આદતો અને હિપેટાઇટિસ રસી તેનું રક્ષણ કરે છે.',
    points_en:['Avoid alcohol and unneeded medicines','Get vaccinated against hepatitis B','Eat a balanced, low-fat diet','Maintain a healthy weight'],
    points_gu:['દારૂ અને બિનજરૂરી દવાઓ ટાળો','હિપેટાઇટિસ બી સામે રસી લો','સંતુલિત, ઓછી ચરબીવાળો આહાર લો','સ્વસ્થ વજન જાળવો'],
    cta_en:'Love your liver — eat clean, avoid alcohol.', cta_gu:'તમારા લીવરની સંભાળ લો — સ્વચ્છ ખાઓ, દારૂ ટાળો.',
    hashtags:['LiverHealth','HealthyLiver','HepatitisFree'], icon:'leaf', category:'Health'
  },
  'respiratory-health': {
    title_en:'Respiratory Health Awareness Day', title_gu:'શ્વસન આરોગ્ય જાગૃતિ દિવસ',
    importance_en:'Clean air and healthy lungs support every breath; avoiding smoke prevents lung disease.',
    importance_gu:'સ્વચ્છ હવા અને સ્વસ્થ ફેફસાં દરેક શ્વાસને ટેકો આપે છે; ધુમાડાથી બચવાથી ફેફસાંનો રોગ અટકે છે.',
    points_en:['Avoid tobacco and second-hand smoke','Reduce exposure to indoor and outdoor pollution','Ventilate cooking areas well','Seek care for a long-lasting cough'],
    points_gu:['તમાકુ અને પરોક્ષ ધુમાડો ટાળો','ઘર અંદર-બહારના પ્રદૂષણનો સંપર્ક ઘટાડો','રસોઈના વિસ્તારમાં સારી હવાની અવરજવર રાખો','લાંબી ખાંસી માટે સંભાળ લો'],
    cta_en:'Breathe easy — protect your lungs from smoke.', cta_gu:'સરળ શ્વાસ લો — ધુમાડાથી તમારા ફેફસાંનું રક્ષણ કરો.',
    hashtags:['LungHealth','BreatheClean','RespiratoryHealth'], icon:'leaf', category:'Health'
  },
  'food-safety': {
    title_en:'Food Safety Awareness Day', title_gu:'ખાદ્ય સુરક્ષા જાગૃતિ દિવસ',
    importance_en:'Safe food handling prevents food poisoning and keeps families healthy.',
    importance_gu:'સલામત ખાદ્ય સંભાળ ફૂડ પોઇઝનિંગ અટકાવે છે અને પરિવારને સ્વસ્થ રાખે છે.',
    points_en:['Wash hands and surfaces before cooking','Keep raw and cooked food separate','Cook food thoroughly and serve hot','Store perishables cold and check dates'],
    points_gu:['રસોઈ પહેલાં હાથ અને સપાટી ધોવો','કાચો અને રાંધેલો ખોરાક અલગ રાખો','ખોરાક બરાબર રાંધો અને ગરમ પીરસો','બગડનારો ખોરાક ઠંડો રાખો અને તારીખ તપાસો'],
    cta_en:'Keep food safe — clean, separate, cook, chill.', cta_gu:'ખોરાક સલામત રાખો — સાફ કરો, અલગ કરો, રાંધો, ઠંડો રાખો.',
    hashtags:['FoodSafety','SafeFood','EatSafe'], icon:'apple', category:'Public Health'
  },
  'sanitation': {
    title_en:'Sanitation Awareness Day', title_gu:'સ્વચ્છતા જાગૃતિ દિવસ',
    importance_en:'Safe toilets and clean surroundings stop the spread of disease and protect dignity.',
    importance_gu:'સલામત શૌચાલય અને સ્વચ્છ આસપાસ રોગનો ફેલાવો અટકાવે છે અને ગૌરવનું રક્ષણ કરે છે.',
    points_en:['Always use a toilet, never open ground','Wash hands after using the toilet','Keep water sources away from waste','Dispose of household waste safely'],
    points_gu:['હંમેશા શૌચાલય વાપરો, ખુલ્લામાં ક્યારેય નહીં','શૌચાલય પછી હાથ ધોવો','પાણીના સ્રોત કચરાથી દૂર રાખો','ઘરનો કચરો સલામત રીતે નિકાલ કરો'],
    cta_en:'Clean surroundings, healthy community — use toilets.', cta_gu:'સ્વચ્છ આસપાસ, સ્વસ્થ સમુદાય — શૌચાલય વાપરો.',
    hashtags:['Sanitation','SwachhBharat','CleanForHealth'], icon:'shield', category:'Public Health'
  },
  'occupational-health': {
    title_en:'Occupational Health Awareness Day', title_gu:'વ્યાવસાયિક આરોગ્ય જાગૃતિ દિવસ',
    importance_en:'Safe workplaces prevent injury and illness and keep workers productive.',
    importance_gu:'સલામત કાર્યસ્થળ ઈજા અને બીમારી અટકાવે છે અને કામદારોને ઉત્પાદક રાખે છે.',
    points_en:['Use protective equipment provided','Follow safe procedures and signage','Take breaks to avoid strain','Report hazards and near-misses'],
    points_gu:['આપેલા રક્ષણાત્મક સાધનો વાપરો','સલામત પ્રક્રિયા અને સંકેતોનું પાલન કરો','તાણ ટાળવા વિરામ લો','જોખમો અને લગભગ-અકસ્માતોની જાણ કરો'],
    cta_en:'Safety first — protect yourself at work.', cta_gu:'સલામતી પ્રથમ — કામ પર તમારું રક્ષણ કરો.',
    hashtags:['WorkplaceSafety','OccupationalHealth','SafetyFirst'], icon:'helmet', category:'Occupational Health'
  },
  'first-aid': {
    title_en:'First Aid Awareness Day', title_gu:'પ્રાથમિક સારવાર જાગૃતિ દિવસ',
    importance_en:'Basic first aid in the first minutes can save a life before medical help arrives.',
    importance_gu:'પ્રથમ મિનિટોમાં પ્રાથમિક સારવાર તબીબી મદદ પહોંચતાં પહેલાં જીવન બચાવી શકે છે.',
    points_en:['Keep a stocked first-aid kit at home','Learn to stop bleeding with pressure','Know how to help someone choking','Save emergency numbers on your phone'],
    points_gu:['ઘરે ભરેલી પ્રાથમિક સારવાર કીટ રાખો','દબાણથી રક્તસ્રાવ રોકતાં શીખો','ગૂંગળાતી વ્યક્તિને મદદ કરવાનું જાણો','ફોનમાં કટોકટી નંબર સાચવો'],
    cta_en:'Learn first aid — be ready to save a life.', cta_gu:'પ્રાથમિક સારવાર શીખો — જીવન બચાવવા તૈયાર રહો.',
    hashtags:['FirstAid','BeReady','SaveALife'], icon:'firstaid', category:'Emergency Preparedness'
  },
  'organ-donation': {
    title_en:'Organ Donation Awareness Day', title_gu:'અંગદાન જાગૃતિ દિવસ',
    importance_en:'One organ donor can save several lives; pledging and informing family makes it possible.',
    importance_gu:'એક અંગદાતા અનેક જીવન બચાવી શકે છે; સંકલ્પ લેવો અને પરિવારને જણાવવું તેને શક્ય બનાવે છે.',
    points_en:['Learn the facts about organ donation','Register your pledge to donate','Tell your family your decision','Encourage others to consider donating'],
    points_gu:['અંગદાન વિશે હકીકતો જાણો','દાનનો સંકલ્પ નોંધાવો','તમારો નિર્ણય પરિવારને જણાવો','અન્યને દાન વિચારવા પ્રોત્સાહિત કરો'],
    cta_en:'Pledge to donate — give the gift of life.', cta_gu:'દાનનો સંકલ્પ લો — જીવનની ભેટ આપો.',
    hashtags:['OrganDonation','DonateLife','PledgeToDonate'], icon:'heart', category:'Health'
  },
  'blood-donation': {
    title_en:'Blood Donation Awareness Day', title_gu:'રક્તદાન જાગૃતિ દિવસ',
    importance_en:'Safe, voluntary blood donation saves lives in surgery, childbirth and emergencies.',
    importance_gu:'સલામત, સ્વૈચ્છિક રક્તદાન સર્જરી, પ્રસૂતિ અને કટોકટીમાં જીવન બચાવે છે.',
    points_en:['Donate blood voluntarily and regularly','Eat well and hydrate before donating','A healthy adult can donate every 3 months','Encourage friends to donate too'],
    points_gu:['સ્વૈચ્છિક અને નિયમિત રક્તદાન કરો','દાન પહેલાં સારું ખાઓ અને પાણી પીઓ','સ્વસ્થ પુખ્ત દર 3 મહિને દાન કરી શકે','મિત્રોને પણ દાન કરવા પ્રોત્સાહિત કરો'],
    cta_en:'Donate blood — a small act, a big difference.', cta_gu:'રક્તદાન કરો — નાનું કાર્ય, મોટો ફરક.',
    hashtags:['DonateBlood','BloodDonation','GiveBlood'], icon:'heart', category:'Health'
  },
  'amr-awareness': {
    title_en:'Antimicrobial Resistance Awareness Day', title_gu:'એન્ટિમાઇક્રોબાયલ પ્રતિરોધ જાગૃતિ દિવસ',
    importance_en:'Misusing antibiotics makes them stop working; using them wisely keeps them effective.',
    importance_gu:'એન્ટિબાયોટિકનો દુરુપયોગ તેમને નિષ્ક્રિય બનાવે છે; સમજદારીથી વાપરવાથી તે અસરકારક રહે છે.',
    points_en:['Take antibiotics only when prescribed','Never share or reuse leftover antibiotics','Complete the full prescribed course','Prevent infection with hygiene and vaccines'],
    points_gu:['ફક્ત સૂચવ્યા હોય ત્યારે એન્ટિબાયોટિક લો','બચેલી એન્ટિબાયોટિક શેર કે પુનઃઉપયોગ ન કરો','સૂચવેલ પૂરો કોર્સ પૂર્ણ કરો','સ્વચ્છતા અને રસીથી ચેપ અટકાવો'],
    cta_en:'Use antibiotics wisely — keep them working.', cta_gu:'એન્ટિબાયોટિક સમજદારીથી વાપરો — તેમને અસરકારક રાખો.',
    hashtags:['StopAMR','AntibioticAwareness','HandleWithCare'], icon:'syringe', category:'Public Health'
  },
  'zoonotic-prevention': {
    title_en:'Zoonotic Disease Prevention Day', title_gu:'પ્રાણીજન્ય રોગ નિવારણ દિવસ',
    importance_en:'Many diseases pass between animals and people; simple care lowers the risk.',
    importance_gu:'અનેક રોગો પ્રાણી અને માણસ વચ્ચે ફેલાય છે; સરળ સંભાળ જોખમ ઘટાડે છે.',
    points_en:['Wash hands after touching animals','Vaccinate pets and livestock','Avoid contact with sick or stray animals','Seek care immediately after animal bites'],
    points_gu:['પ્રાણીઓને સ્પર્શ્યા પછી હાથ ધોવો','પાળતુ અને પશુધનને રસી અપાવો','બીમાર કે રખડતા પ્રાણીઓથી દૂર રહો','પ્રાણી કરડે તો તરત સંભાળ લો'],
    cta_en:'Protect people and animals — prevent zoonoses.', cta_gu:'લોકો અને પ્રાણીઓનું રક્ષણ કરો — પ્રાણીજન્ય રોગ અટકાવો.',
    hashtags:['OneHealth','ZoonosesPrevention','HealthyAnimals'], icon:'shield', category:'Public Health'
  },
  'one-health': {
    title_en:'One Health Awareness Day', title_gu:'વન હેલ્થ જાગૃતિ દિવસ',
    importance_en:'Human, animal and environmental health are connected; caring for all keeps us safer.',
    importance_gu:'માનવ, પ્રાણી અને પર્યાવરણનું આરોગ્ય જોડાયેલું છે; બધાની સંભાળ આપણને વધુ સુરક્ષિત રાખે છે.',
    points_en:['Keep shared water and food clean','Handle animals and waste safely','Support responsible antibiotic use','Protect the local environment'],
    points_gu:['સહિયારું પાણી અને ખોરાક સ્વચ્છ રાખો','પ્રાણી અને કચરો સલામત રીતે સંભાળો','જવાબદાર એન્ટિબાયોટિક વપરાશને ટેકો આપો','સ્થાનિક પર્યાવરણનું રક્ષણ કરો'],
    cta_en:'One Health — healthy people, animals and planet.', cta_gu:'વન હેલ્થ — સ્વસ્થ લોકો, પ્રાણીઓ અને ધરતી.',
    hashtags:['OneHealth','HealthyPlanet','ConnectedHealth'], icon:'globe', category:'Public Health'
  },
  'climate-health': {
    title_en:'Climate and Health Awareness Day', title_gu:'આબોહવા અને આરોગ્ય જાગૃતિ દિવસ',
    importance_en:'A changing climate affects heat, air and disease; local action protects health.',
    importance_gu:'બદલાતી આબોહવા ગરમી, હવા અને રોગ પર અસર કરે છે; સ્થાનિક પગલાં આરોગ્યનું રક્ષણ કરે છે.',
    points_en:['Stay hydrated and cool during heatwaves','Reduce, reuse and recycle waste','Use less energy and cleaner transport','Plant and protect trees locally'],
    points_gu:['ગરમીના મોજામાં પાણી પીઓ અને ઠંડા રહો','કચરો ઘટાડો, પુનઃઉપયોગ અને રિસાયકલ કરો','ઓછી ઊર્જા અને સ્વચ્છ પરિવહન વાપરો','સ્થાનિક રીતે વૃક્ષો રોપો અને રક્ષણ કરો'],
    cta_en:'Act on climate — protect health for all.', cta_gu:'આબોહવા માટે પગલાં લો — બધા માટે આરોગ્યનું રક્ષણ કરો.',
    hashtags:['ClimateAndHealth','ClimateAction','HealthyPlanet'], icon:'leaf', category:'Health & Environment'
  }
};

// ---- Content library (BATCH 2: official health days) ----
const OFFICIAL_HEALTH_CONTENT = {
  'world-cancer-day': {
    title_en:'World Cancer Day', title_gu:'વિશ્વ કેન્સર દિવસ',
    importance_en:'A global awareness day to close the care gap; many cancers can be prevented or treated when found early.',
    importance_gu:'સંભાળની ખાઈ દૂર કરવા માટેનો વૈશ્વિક જાગૃતિ દિવસ; અનેક કેન્સર વહેલાં મળે તો અટકાવી કે સારવાર કરી શકાય છે.',
    points_en:['Avoid tobacco and limit alcohol','Eat healthy and stay active','Know the early warning signs','Attend recommended screenings'],
    points_gu:['તમાકુ ટાળો અને દારૂ મર્યાદિત કરો','સ્વસ્થ ખાઓ અને સક્રિય રહો','વહેલા ચેતવણી ચિહ્નો જાણો','ભલામણ કરેલ સ્ક્રીનિંગ કરાવો'],
    cta_en:'Act early against cancer — prevent, detect, treat.', cta_gu:'કેન્સર સામે વહેલા પગલાં લો — અટકાવો, શોધો, સારવાર કરો.',
    hashtags:['WorldCancerDay','CloseTheCareGap','CancerAwareness'], icon:'shield', category:'Health'
  },
  'childhood-cancer-day': {
    title_en:'International Childhood Cancer Day', title_gu:'આંતરરાષ્ટ્રીય બાળ કેન્સર દિવસ',
    importance_en:'Childhood cancer is often treatable; early diagnosis and complete care give the best chance of cure.',
    importance_gu:'બાળ કેન્સર ઘણી વાર સારવારપાત્ર છે; વહેલું નિદાન અને પૂર્ણ સંભાળ સાજા થવાની શ્રેષ્ઠ તક આપે છે.',
    points_en:['Notice persistent unexplained symptoms','Seek prompt medical evaluation','Support families through treatment','Never abandon treatment midway'],
    points_gu:['સતત અસ્પષ્ટ લક્ષણો પર ધ્યાન આપો','તાત્કાલિક તબીબી તપાસ કરાવો','સારવાર દરમિયાન પરિવારોને સહારો આપો','સારવાર વચ્ચે ક્યારેય છોડશો નહીં'],
    cta_en:'Give every child with cancer a fair chance.', cta_gu:'કેન્સરગ્રસ્ત દરેક બાળકને યોગ્ય તક આપો.',
    hashtags:['ChildhoodCancer','ICCD','BetterSurvival'], icon:'child', category:'Health'
  },
  'world-obesity-day': {
    title_en:'World Obesity Day', title_gu:'વિશ્વ મેદસ્વિતા દિવસ',
    importance_en:'Obesity is a complex health condition that raises the risk of diabetes, heart disease and more.',
    importance_gu:'મેદસ્વિતા એક જટિલ આરોગ્ય સ્થિતિ છે જે ડાયાબિટીસ, હૃદયરોગ અને વધુનું જોખમ વધારે છે.',
    points_en:['Choose balanced portions and whole foods','Cut sugary drinks and ultra-processed snacks','Be active for 30–60 minutes a day','Seek support without blame or stigma'],
    points_gu:['સંતુલિત ભાગ અને આખો ખોરાક પસંદ કરો','ખાંડવાળા પીણાં અને અતિ-પ્રોસેસ્ડ નાસ્તા ઘટાડો','દિવસમાં 30–60 મિનિટ સક્રિય રહો','દોષ કે કલંક વગર સહારો લો'],
    cta_en:'Address obesity with support, not stigma.', cta_gu:'મેદસ્વિતાનો સામનો સહારાથી કરો, કલંકથી નહીં.',
    hashtags:['WorldObesityDay','HealthyWeight','ActOnObesity'], icon:'apple', category:'Health'
  },
  'national-vaccination-day': {
    title_en:'National Vaccination Day', title_gu:'રાષ્ટ્રીય રસીકરણ દિવસ',
    importance_en:'India marks this day to reaffirm the power of vaccines in protecting children and communities.',
    importance_gu:'ભારત આ દિવસે બાળકો અને સમુદાયોના રક્ષણમાં રસીની શક્તિની પુનઃપુષ્ટિ કરે છે.',
    points_en:['Complete every dose on schedule','Keep vaccination cards safe','Support polio and routine immunisation drives','Clear doubts with a health worker'],
    points_gu:['દરેક ડોઝ સમયસર પૂર્ણ કરો','રસીકરણ કાર્ડ સુરક્ષિત રાખો','પોલિયો અને નિયમિત રસીકરણ ઝુંબેશને ટેકો આપો','આરોગ્ય કાર્યકર સાથે શંકા દૂર કરો'],
    cta_en:'Vaccinate on time — protect the next generation.', cta_gu:'સમયસર રસી લો — આવનારી પેઢીનું રક્ષણ કરો.',
    hashtags:['NationalVaccinationDay','Immunisation','VaccinesWork'], icon:'syringe', category:'Health'
  },
  'world-oral-health-day': {
    title_en:'World Oral Health Day', title_gu:'વિશ્વ મૌખિક આરોગ્ય દિવસ',
    importance_en:'A healthy mouth supports eating, speaking and confidence, and reflects overall health.',
    importance_gu:'સ્વસ્થ મોં ખાવા, બોલવા અને આત્મવિશ્વાસને ટેકો આપે છે અને સમગ્ર આરોગ્ય દર્શાવે છે.',
    points_en:['Brush twice daily with fluoride toothpaste','Clean between teeth every day','Limit sugary food and drinks','Have regular dental check-ups'],
    points_gu:['ફ્લોરાઇડ ટૂથપેસ્ટથી દિવસમાં બે વાર બ્રશ કરો','દરરોજ દાંત વચ્ચે સફાઈ કરો','ખાંડવાળા ખોરાક-પીણાં મર્યાદિત કરો','નિયમિત દંત તપાસ કરાવો'],
    cta_en:'Be proud of your mouth — care for it daily.', cta_gu:'તમારા મોં પર ગર્વ કરો — રોજ તેની સંભાળ લો.',
    hashtags:['WorldOralHealthDay','MouthProud','OralHealth'], icon:'heart', category:'Health'
  },
  'world-tb-day': {
    title_en:'World Tuberculosis Day', title_gu:'વિશ્વ ક્ષય રોગ દિવસ',
    importance_en:'A WHO awareness day to end TB — a curable, airborne disease that still affects millions.',
    importance_gu:'ટીબી નાબૂદ કરવા માટેનો WHO જાગૃતિ દિવસ — હવાજન્ય, સાજો થઈ શકતો રોગ જે હજી લાખોને અસર કરે છે.',
    points_en:['Get a cough over two weeks tested','Cover coughs and ventilate rooms','Complete the full TB treatment','Support people affected by TB'],
    points_gu:['બે અઠવાડિયાથી વધુ ખાંસી હોય તો તપાસ કરાવો','ખાંસી ઢાંકો અને ઓરડામાં હવા આવવા દો','ટીબીની પૂરી સારવાર પૂર્ણ કરો','ટીબીથી પ્રભાવિત લોકોને સહારો આપો'],
    cta_en:'End TB — test early, treat fully.', cta_gu:'ટીબી નાબૂદ કરો — વહેલી તપાસ, પૂર્ણ સારવાર.',
    hashtags:['WorldTBDay','EndTB','YesWeCanEndTB'], icon:'virus', category:'Health'
  },
  'world-health-day': {
    title_en:'World Health Day', title_gu:'વિશ્વ આરોગ્ય દિવસ',
    importance_en:'Marked by WHO on its founding day to promote health and wellbeing for everyone, everywhere.',
    importance_gu:'WHO દ્વારા તેના સ્થાપના દિવસે દરેક જગ્યાએ દરેક માટે આરોગ્ય અને સુખાકારીને પ્રોત્સાહન આપવા ઉજવાય છે.',
    points_en:['Make one healthy change today','Support access to care for all','Eat well, move more, rest enough','Look after your mental health too'],
    points_gu:['આજે એક સ્વસ્થ ફેરફાર કરો','બધા માટે સંભાળની ઉપલબ્ધતાને ટેકો આપો','સારું ખાઓ, વધુ ચાલો, પૂરતો આરામ કરો','તમારા માનસિક આરોગ્યની પણ સંભાળ લો'],
    cta_en:'Health for all — start with one healthy step.', cta_gu:'બધા માટે આરોગ્ય — એક સ્વસ્થ પગલાથી શરૂ કરો.',
    hashtags:['WorldHealthDay','HealthForAll','Wellbeing'], icon:'cross', category:'Health'
  },
  'world-haemophilia-day': {
    title_en:'World Haemophilia Day', title_gu:'વિશ્વ હિમોફિલિયા દિવસ',
    importance_en:'Awareness of bleeding disorders helps people get diagnosed and treated for a fuller life.',
    importance_gu:'રક્તસ્રાવ વિકારો વિશે જાગૃતિ લોકોને નિદાન અને સારવાર મેળવવામાં મદદ કરે છે જેથી પૂર્ણ જીવન જીવી શકાય.',
    points_en:['Recognise unusual or prolonged bleeding','Seek specialist diagnosis and care','Avoid injury and unadvised injections','Support access to safe treatment'],
    points_gu:['અસામાન્ય કે લાંબા રક્તસ્રાવને ઓળખો','નિષ્ણાત નિદાન અને સંભાળ લો','ઈજા અને સલાહ વગરના ઇન્જેક્શન ટાળો','સલામત સારવારની ઉપલબ્ધતાને ટેકો આપો'],
    cta_en:'Know bleeding disorders — diagnose and support.', cta_gu:'રક્તસ્રાવ વિકારો જાણો — નિદાન કરો અને સહારો આપો.',
    hashtags:['WorldHaemophiliaDay','BleedingDisorders','Access'], icon:'heart', category:'Health'
  },
  'world-malaria-day': {
    title_en:'World Malaria Day', title_gu:'વિશ્વ મેલેરિયા દિવસ',
    importance_en:'A WHO awareness day for a preventable, curable disease spread by mosquitoes.',
    importance_gu:'મચ્છરોથી ફેલાતા અટકાવી શકાય તેવા, સાજા થઈ શકતા રોગ માટેનો WHO જાગૃતિ દિવસ.',
    points_en:['Sleep under an insecticide-treated net','Remove stagnant water near homes','Test any fever with chills promptly','Complete antimalarial treatment fully'],
    points_gu:['જંતુનાશકયુક્ત મચ્છરદાની હેઠળ સૂઓ','ઘર નજીકનું સ્થિર પાણી દૂર કરો','ટાઢ સાથે તાવ હોય તો તરત તપાસ કરાવો','મેલેરિયાની સારવાર પૂરી કરો'],
    cta_en:'Zero malaria begins with you — net up, test early.', cta_gu:'શૂન્ય મેલેરિયા તમારાથી શરૂ થાય — મચ્છરદાની વાપરો, વહેલી તપાસ કરાવો.',
    hashtags:['WorldMalariaDay','ZeroMalaria','EndMalaria'], icon:'mosquito', category:'Health'
  },
  'world-hand-hygiene-day': {
    title_en:'World Hand Hygiene Day', title_gu:'વિશ્વ હાથ સ્વચ્છતા દિવસ',
    importance_en:'A WHO campaign reminding that clean hands in health care save lives.',
    importance_gu:'સ્વચ્છ હાથ આરોગ્ય સંભાળમાં જીવન બચાવે છે તે યાદ અપાવતી WHO ઝુંબેશ.',
    points_en:['Clean hands at the right moments','Use soap and water or sanitiser','Scrub all surfaces of the hands','Encourage hand hygiene in clinics'],
    points_gu:['યોગ્ય સમયે હાથ સાફ કરો','સાબુ-પાણી કે સેનિટાઇઝર વાપરો','હાથની બધી સપાટી ઘસો','ક્લિનિકમાં હાથ સ્વચ્છતાને પ્રોત્સાહન આપો'],
    cta_en:'Clean hands save lives — every time.', cta_gu:'સ્વચ્છ હાથ જીવન બચાવે છે — દર વખતે.',
    hashtags:['HandHygiene','CleanHands','WHO'], icon:'shield', category:'Health'
  },
  'international-nurses-day': {
    title_en:'International Nurses Day', title_gu:'આંતરરાષ્ટ્રીય નર્સ દિવસ',
    importance_en:'A global day honouring nurses, whose care and skill are the backbone of health systems.',
    importance_gu:'નર્સોને સન્માન આપતો વૈશ્વિક દિવસ, જેમની સંભાળ અને કૌશલ્ય આરોગ્ય તંત્રની કરોડરજ્જુ છે.',
    points_en:['Thank and respect nursing staff','Support safe staffing and training','Follow nurses’ health advice','Encourage youth to join nursing'],
    points_gu:['નર્સિંગ સ્ટાફનો આભાર માનો અને સન્માન કરો','સલામત સ્ટાફિંગ અને તાલીમને ટેકો આપો','નર્સોની આરોગ્ય સલાહ અનુસરો','યુવાનોને નર્સિંગમાં જોડાવા પ્રોત્સાહિત કરો'],
    cta_en:'Honour nurses — the heart of care.', cta_gu:'નર્સોને સન્માન આપો — સંભાળનું હૃદય.',
    hashtags:['NursesDay','ThankANurse','Healthcare'], icon:'cross', category:'Health'
  },
  'world-hypertension-day': {
    title_en:'World Hypertension Day', title_gu:'વિશ્વ હાયપરટેન્શન દિવસ',
    importance_en:'High blood pressure is a silent risk for heart disease and stroke; measuring it is the first step.',
    importance_gu:'હાઈ બ્લડપ્રેશર હૃદયરોગ અને સ્ટ્રોકનું મૌન જોખમ છે; તેને માપવું એ પ્રથમ પગલું છે.',
    points_en:['Measure your blood pressure accurately','Cut down on salt','Stay active and keep a healthy weight','Take medicines regularly if prescribed'],
    points_gu:['તમારું બ્લડપ્રેશર ચોકસાઈથી માપો','મીઠું ઓછું કરો','સક્રિય રહો અને સ્વસ્થ વજન રાખો','સૂચવ્યું હોય તો દવા નિયમિત લો'],
    cta_en:'Measure your pressure, control your risk.', cta_gu:'તમારું પ્રેશર માપો, તમારું જોખમ નિયંત્રિત કરો.',
    hashtags:['WorldHypertensionDay','KnowYourNumbers','BloodPressure'], icon:'heart', category:'Health'
  },
  'menstrual-hygiene-day': {
    title_en:'Menstrual Hygiene Day', title_gu:'માસિક સ્વચ્છતા દિવસ',
    importance_en:'Safe, informed menstrual care protects health and dignity and ends stigma.',
    importance_gu:'સલામત, જાણકાર માસિક સંભાળ આરોગ્ય અને ગૌરવનું રક્ષણ કરે છે અને કલંક દૂર કરે છે.',
    points_en:['Use clean, safe menstrual materials','Change and dispose of them hygienically','Talk openly to end period stigma','Ensure access to toilets and water'],
    points_gu:['સ્વચ્છ, સલામત માસિક સામગ્રી વાપરો','તેમને સ્વચ્છ રીતે બદલો અને નિકાલ કરો','પીરિયડ કલંક દૂર કરવા ખુલ્લેઆમ વાત કરો','શૌચાલય અને પાણીની ઉપલબ્ધતા સુનિશ્ચિત કરો'],
    cta_en:'Normalise menstruation — hygiene and dignity for all.', cta_gu:'માસિકને સામાન્ય બનાવો — બધા માટે સ્વચ્છતા અને ગૌરવ.',
    hashtags:['MenstrualHygieneDay','PeriodsAreNormal','MHDay'], icon:'woman', category:'Health'
  },
  'world-no-tobacco-day': {
    title_en:'World No Tobacco Day', title_gu:'વિશ્વ તમાકુ નિષેધ દિવસ',
    importance_en:'A WHO day highlighting the harms of tobacco and the benefits of quitting.',
    importance_gu:'તમાકુના નુકસાન અને છોડવાના લાભ દર્શાવતો WHO દિવસ.',
    points_en:['Quit tobacco in every form','Protect others from second-hand smoke','Use a quit helpline or counselling','Support smoke-free public spaces'],
    points_gu:['દરેક સ્વરૂપમાં તમાકુ છોડો','અન્યને પરોક્ષ ધુમાડાથી બચાવો','ક્વિટ હેલ્પલાઇન કે સલાહ લો','ધુમાડામુક્ત જાહેર જગ્યાઓને ટેકો આપો'],
    cta_en:'Quit tobacco — protect yourself and others.', cta_gu:'તમાકુ છોડો — તમારું અને અન્યનું રક્ષણ કરો.',
    hashtags:['WorldNoTobaccoDay','QuitTobacco','TobaccoFree'], icon:'shield', category:'Health'
  },
  'world-food-safety-day': {
    title_en:'World Food Safety Day', title_gu:'વિશ્વ ખાદ્ય સુરક્ષા દિવસ',
    importance_en:'A UN/WHO day reminding that safe food prevents illness from farm to plate.',
    importance_gu:'સલામત ખોરાક ખેતરથી થાળી સુધી બીમારી અટકાવે છે તે યાદ અપાવતો UN/WHO દિવસ.',
    points_en:['Keep hands and surfaces clean','Separate raw and cooked foods','Cook and reheat food thoroughly','Store food at safe temperatures'],
    points_gu:['હાથ અને સપાટી સ્વચ્છ રાખો','કાચો અને રાંધેલો ખોરાક અલગ રાખો','ખોરાક બરાબર રાંધો અને ફરી ગરમ કરો','ખોરાક સલામત તાપમાને સંગ્રહો'],
    cta_en:'Safe food today for a healthy tomorrow.', cta_gu:'સ્વસ્થ આવતીકાલ માટે આજે સલામત ખોરાક.',
    hashtags:['WorldFoodSafetyDay','SafeFood','FoodSafety'], icon:'apple', category:'Health'
  },
  'world-blood-donor-day': {
    title_en:'World Blood Donor Day', title_gu:'વિશ્વ રક્તદાતા દિવસ',
    importance_en:'A WHO day thanking voluntary blood donors whose gift saves lives every day.',
    importance_gu:'સ્વૈચ્છિક રક્તદાતાઓનો આભાર માનતો WHO દિવસ જેમની ભેટ રોજ જીવન બચાવે છે.',
    points_en:['Donate blood voluntarily','Donate regularly if eligible','Eat and hydrate well before donating','Encourage others to give blood'],
    points_gu:['સ્વૈચ્છિક રક્તદાન કરો','પાત્ર હો તો નિયમિત દાન કરો','દાન પહેલાં સારું ખાઓ અને પાણી પીઓ','અન્યને રક્તદાન કરવા પ્રોત્સાહિત કરો'],
    cta_en:'Give blood, give life — donate today.', cta_gu:'રક્ત આપો, જીવન આપો — આજે દાન કરો.',
    hashtags:['WorldBloodDonorDay','GiveBlood','DonateBlood'], icon:'heart', category:'Health'
  },
  'world-sickle-cell-day': {
    title_en:'World Sickle Cell Day', title_gu:'વિશ્વ સિકલ સેલ દિવસ',
    importance_en:'A UN-recognised day to raise awareness of sickle cell disease and support those affected.',
    importance_gu:'સિકલ સેલ રોગ વિશે જાગૃતિ લાવવા અને પ્રભાવિતોને સહારો આપવા માટેનો UN-માન્ય દિવસ.',
    points_en:['Learn about sickle cell disease','Get screening and genetic counselling','Stay hydrated and avoid triggers','Support regular medical follow-up'],
    points_gu:['સિકલ સેલ રોગ વિશે જાણો','સ્ક્રીનિંગ અને આનુવંશિક સલાહ લો','પાણી પીતા રહો અને ટ્રિગર ટાળો','નિયમિત તબીબી ફોલો-અપને ટેકો આપો'],
    cta_en:'Know sickle cell — screen, support, care.', cta_gu:'સિકલ સેલ જાણો — સ્ક્રીનિંગ, સહારો, સંભાળ.',
    hashtags:['SickleCellDay','SickleCell','Awareness'], icon:'heart', category:'Health'
  },
  'national-doctors-day': {
    title_en:"National Doctors' Day", title_gu:'રાષ્ટ્રીય ડૉક્ટર દિવસ',
    importance_en:'India honours doctors for their service and dedication to patients and public health.',
    importance_gu:'ભારત ડૉક્ટરોની દર્દીઓ અને જાહેર આરોગ્ય પ્રત્યેની સેવા અને સમર્પણ માટે સન્માન કરે છે.',
    points_en:['Thank the doctors who care for you','Follow medical advice and follow-ups','Respect health workers’ safety','Support ethical, evidence-based care'],
    points_gu:['તમારી સંભાળ લેતા ડૉક્ટરોનો આભાર માનો','તબીબી સલાહ અને ફોલો-અપ અનુસરો','આરોગ્ય કાર્યકરોની સલામતીનું સન્માન કરો','નૈતિક, પુરાવા-આધારિત સંભાળને ટેકો આપો'],
    cta_en:'Thank a doctor — respect those who heal.', cta_gu:'ડૉક્ટરનો આભાર માનો — સાજા કરનારાઓનું સન્માન કરો.',
    hashtags:['DoctorsDay','ThankYouDoctors','Healthcare'], icon:'cross', category:'Health'
  },
  'world-hepatitis-day': {
    title_en:'World Hepatitis Day', title_gu:'વિશ્વ હિપેટાઇટિસ દિવસ',
    importance_en:'A WHO day to find the millions living with viral hepatitis and prevent liver disease.',
    importance_gu:'વાયરલ હિપેટાઇટિસ સાથે જીવતા લાખોને શોધવા અને લીવર રોગ અટકાવવા માટેનો WHO દિવસ.',
    points_en:['Get vaccinated against hepatitis B','Get tested if at risk','Use only sterile needles and safe blood','Seek treatment to protect your liver'],
    points_gu:['હિપેટાઇટિસ બી સામે રસી લો','જોખમ હોય તો તપાસ કરાવો','ફક્ત જંતુમુક્ત સોય અને સલામત રક્ત વાપરો','લીવરના રક્ષણ માટે સારવાર લો'],
    cta_en:'Test and vaccinate — beat hepatitis.', cta_gu:'તપાસ કરાવો અને રસી લો — હિપેટાઇટિસને હરાવો.',
    hashtags:['WorldHepatitisDay','HepatitisCantWait','LiverHealth'], icon:'leaf', category:'Health'
  },
  'world-suicide-prevention-day': {
    title_en:'World Suicide Prevention Day', title_gu:'વિશ્વ આત્મહત્યા નિવારણ દિવસ',
    importance_en:'Suicide is preventable; listening, support and timely help save lives.',
    importance_gu:'આત્મહત્યા અટકાવી શકાય છે; સાંભળવું, સહારો અને સમયસર મદદ જીવન બચાવે છે.',
    points_en:['Take talk of hopelessness seriously','Listen without judging','Connect people to professional help','Stay in touch and follow up'],
    points_gu:['નિરાશાની વાતને ગંભીરતાથી લો','નિર્ણય કર્યા વગર સાંભળો','લોકોને વ્યાવસાયિક મદદ સાથે જોડો','સંપર્કમાં રહો અને ફોલો-અપ કરો'],
    cta_en:'Reach out — a caring word can save a life.', cta_gu:'વાત કરો — એક કાળજીભર્યો શબ્દ જીવન બચાવી શકે.',
    hashtags:['SuicidePrevention','WSPD','YouAreNotAlone'], icon:'brain', category:'Health'
  },
  'world-patient-safety-day': {
    title_en:'World Patient Safety Day', title_gu:'વિશ્વ દર્દી સુરક્ષા દિવસ',
    importance_en:'A WHO day to reduce avoidable harm and make health care safer for every patient.',
    importance_gu:'ટાળી શકાય તેવું નુકસાન ઘટાડવા અને દરેક દર્દી માટે આરોગ્ય સંભાળ સલામત બનાવવા માટેનો WHO દિવસ.',
    points_en:['Ask questions about your care','Share your full medicine list','Confirm correct medicine and dose','Report safety concerns without fear'],
    points_gu:['તમારી સંભાળ વિશે પ્રશ્નો પૂછો','તમારી સંપૂર્ણ દવાની યાદી આપો','સાચી દવા અને ડોઝની ખાતરી કરો','ડર વગર સલામતી ચિંતાઓની જાણ કરો'],
    cta_en:'Speak up for safe care — for every patient.', cta_gu:'સલામત સંભાળ માટે અવાજ ઉઠાવો — દરેક દર્દી માટે.',
    hashtags:['PatientSafety','WorldPatientSafetyDay','SafeCare'], icon:'cross', category:'Health'
  },
  'world-heart-day': {
    title_en:'World Heart Day', title_gu:'વિશ્વ હૃદય દિવસ',
    importance_en:'A global campaign to fight cardiovascular disease with everyday heart-healthy choices.',
    importance_gu:'રોજિંદી હૃદય-સ્વસ્થ પસંદગીઓથી હૃદયરોગ સામે લડવાની વૈશ્વિક ઝુંબેશ.',
    points_en:['Be active for 30 minutes daily','Eat less salt, sugar and fried food','Avoid tobacco and limit alcohol','Check blood pressure and cholesterol'],
    points_gu:['દરરોજ 30 મિનિટ સક્રિય રહો','ઓછું મીઠું, ખાંડ અને તળેલું ખાઓ','તમાકુ ટાળો અને દારૂ મર્યાદિત કરો','બ્લડપ્રેશર અને કોલેસ્ટ્રોલ તપાસો'],
    cta_en:'Use your heart, love your heart.', cta_gu:'તમારા હૃદયનો ઉપયોગ કરો, તમારા હૃદયને ચાહો.',
    hashtags:['WorldHeartDay','UseHeart','HeartHealth'], icon:'heart', category:'Health'
  },
  'world-mental-health-day': {
    title_en:'World Mental Health Day', title_gu:'વિશ્વ માનસિક આરોગ્ય દિવસ',
    importance_en:'A global day to raise awareness of mental health and support access to care.',
    importance_gu:'માનસિક આરોગ્ય વિશે જાગૃતિ લાવવા અને સંભાળની ઉપલબ્ધતાને ટેકો આપવા માટેનો વૈશ્વિક દિવસ.',
    points_en:['Talk openly about mental health','Check in on friends and family','Practise rest, activity and connection','Seek professional help early'],
    points_gu:['માનસિક આરોગ્ય વિશે ખુલ્લેઆમ વાત કરો','મિત્રો અને પરિવારની ખબર રાખો','આરામ, પ્રવૃત્તિ અને જોડાણનો અભ્યાસ કરો','વહેલી વ્યાવસાયિક મદદ લો'],
    cta_en:'Mental health is a right — talk and seek help.', cta_gu:'માનસિક આરોગ્ય એક અધિકાર છે — વાત કરો અને મદદ લો.',
    hashtags:['WorldMentalHealthDay','MentalHealthMatters','ItsOkayToTalk'], icon:'brain', category:'Health'
  },
  'global-handwashing-day': {
    title_en:'Global Handwashing Day', title_gu:'વૈશ્વિક હાથ ધોવાનો દિવસ',
    importance_en:'A global campaign showing that handwashing with soap is a simple, powerful way to stay well.',
    importance_gu:'સાબુથી હાથ ધોવું એ સ્વસ્થ રહેવાનો સરળ, શક્તિશાળી ઉપાય છે તે દર્શાવતી વૈશ્વિક ઝુંબેશ.',
    points_en:['Wash hands with soap and water','Clean before eating and after the toilet','Teach children to wash properly','Keep soap available at home and school'],
    points_gu:['સાબુ અને પાણીથી હાથ ધોવો','જમતાં પહેલાં અને શૌચાલય પછી ધોવો','બાળકોને બરાબર ધોતાં શીખવો','ઘર અને શાળામાં સાબુ ઉપલબ્ધ રાખો'],
    cta_en:'Clean hands for all — wash with soap.', cta_gu:'બધા માટે સ્વચ્છ હાથ — સાબુથી ધોવો.',
    hashtags:['GlobalHandwashingDay','CleanHands','HandHygiene'], icon:'shield', category:'Health'
  },
  'world-stroke-day': {
    title_en:'World Stroke Day', title_gu:'વિશ્વ સ્ટ્રોક દિવસ',
    importance_en:'Most strokes are preventable, and fast action at the first signs saves brain and life.',
    importance_gu:'મોટાભાગના સ્ટ્રોક અટકાવી શકાય છે, અને પ્રથમ ચિહ્નો પર ઝડપી પગલાં મગજ અને જીવન બચાવે છે.',
    points_en:['Learn the FAST warning signs','Call for emergency help immediately','Control blood pressure and sugar','Stay active and avoid tobacco'],
    points_gu:['FAST ચેતવણી ચિહ્નો શીખો','તરત કટોકટી મદદ બોલાવો','બ્લડપ્રેશર અને શુગર નિયંત્રિત કરો','સક્રિય રહો અને તમાકુ ટાળો'],
    cta_en:'Know stroke signs — act FAST to save a life.', cta_gu:'સ્ટ્રોકના ચિહ્નો જાણો — જીવન બચાવવા FAST પ્રમાણે ઝડપથી કાર્ય કરો.',
    hashtags:['WorldStrokeDay','ActFAST','StrokePrevention'], icon:'brain', category:'Health'
  },
  'world-aids-day': {
    title_en:'World AIDS Day', title_gu:'વિશ્વ એઇડ્સ દિવસ',
    importance_en:'A global day to unite against HIV, support those affected and end stigma.',
    importance_gu:'એચઆઈવી સામે એક થવા, પ્રભાવિતોને સહારો આપવા અને કલંક દૂર કરવા માટેનો વૈશ્વિક દિવસ.',
    points_en:['Know your HIV status through testing','Use protection to prevent transmission','Support treatment that keeps people well','End stigma and discrimination'],
    points_gu:['તપાસ દ્વારા તમારી એચઆઈવી સ્થિતિ જાણો','સંક્રમણ અટકાવવા રક્ષણ વાપરો','લોકોને સ્વસ્થ રાખતી સારવારને ટેકો આપો','કલંક અને ભેદભાવ દૂર કરો'],
    cta_en:'Know your status — end HIV stigma.', cta_gu:'તમારી સ્થિતિ જાણો — એચઆઈવી કલંક દૂર કરો.',
    hashtags:['WorldAIDSDay','KnowYourStatus','EndStigma'], icon:'heart', category:'Health'
  },
  'national-cancer-awareness-day': {
    title_en:'National Cancer Awareness Day', title_gu:'રાષ્ટ્રીય કેન્સર જાગૃતિ દિવસ',
    importance_en:'India marks this day to promote cancer prevention, early detection and timely treatment.',
    importance_gu:'ભારત આ દિવસે કેન્સર નિવારણ, વહેલી તપાસ અને સમયસર સારવારને પ્રોત્સાહન આપે છે.',
    points_en:['Avoid tobacco and alcohol','Recognise warning signs early','Attend free screening camps','Complete treatment without delay'],
    points_gu:['તમાકુ અને દારૂ ટાળો','ચેતવણી ચિહ્નો વહેલા ઓળખો','મફત સ્ક્રીનિંગ કેમ્પમાં જાઓ','વિલંબ વગર સારવાર પૂર્ણ કરો'],
    cta_en:'Fight cancer — prevent, detect and treat early.', cta_gu:'કેન્સર સામે લડો — વહેલા અટકાવો, શોધો અને સારવાર કરો.',
    hashtags:['CancerAwareness','EarlyDetection','FightCancer'], icon:'shield', category:'Health'
  },
  'world-pneumonia-day': {
    title_en:'World Pneumonia Day', title_gu:'વિશ્વ ન્યુમોનિયા દિવસ',
    importance_en:'Pneumonia is a leading cause of child deaths, yet it is preventable and treatable.',
    importance_gu:'ન્યુમોનિયા બાળ મૃત્યુનું મુખ્ય કારણ છે, છતાં તે અટકાવી અને સારવારપાત્ર છે.',
    points_en:['Vaccinate children on schedule','Ensure good nutrition and breastfeeding','Seek care for fast or difficult breathing','Reduce indoor smoke exposure'],
    points_gu:['બાળકોને સમયસર રસી અપાવો','સારું પોષણ અને સ્તનપાન સુનિશ્ચિત કરો','ઝડપી કે મુશ્કેલ શ્વાસ માટે સંભાળ લો','ઘરની અંદરના ધુમાડાનો સંપર્ક ઘટાડો'],
    cta_en:'Protect every breath — prevent pneumonia.', cta_gu:'દરેક શ્વાસનું રક્ષણ કરો — ન્યુમોનિયા અટકાવો.',
    hashtags:['WorldPneumoniaDay','EveryBreathCounts','ChildHealth'], icon:'leaf', category:'Health'
  },
  'world-prematurity-day': {
    title_en:'World Prematurity Day', title_gu:'વિશ્વ અકાળ જન્મ દિવસ',
    importance_en:'Preterm babies need special care; awareness and support improve their survival and growth.',
    importance_gu:'અકાળ જન્મેલા બાળકોને ખાસ સંભાળ જોઈએ; જાગૃતિ અને સહારો તેમના જીવન અને વૃદ્ધિમાં સુધારો કરે છે.',
    points_en:['Attend regular antenatal check-ups','Learn kangaroo mother care','Keep preterm babies warm and fed','Follow up on growth and development'],
    points_gu:['નિયમિત પ્રસૂતિ-પૂર્વ તપાસમાં હાજર રહો','કાંગારૂ મધર કેર શીખો','અકાળ બાળકોને ગરમ અને પોષિત રાખો','વૃદ્ધિ અને વિકાસનું ફોલો-અપ કરો'],
    cta_en:'Give preterm babies a healthy start.', cta_gu:'અકાળ બાળકોને સ્વસ્થ શરૂઆત આપો.',
    hashtags:['WorldPrematurityDay','PretermCare','TinyFighters'], icon:'child', category:'Health'
  },
  'world-zoonoses-day': {
    title_en:'World Zoonoses Day', title_gu:'વિશ્વ ઝૂનોસિસ દિવસ',
    importance_en:'Marks the first rabies vaccination and raises awareness of diseases passing from animals to people.',
    importance_gu:'પ્રથમ હડકવા રસીની યાદ અપાવે છે અને પ્રાણીથી માણસમાં ફેલાતા રોગો વિશે જાગૃતિ લાવે છે.',
    points_en:['Vaccinate pets against rabies','Wash bites and scratches immediately','Avoid contact with sick animals','Seek care promptly after animal bites'],
    points_gu:['પાળતુ પ્રાણીઓને હડકવા સામે રસી અપાવો','ડંખ અને ઉઝરડા તરત ધોવો','બીમાર પ્રાણીઓ સાથે સંપર્ક ટાળો','પ્રાણી કરડે તો તરત સંભાળ લો'],
    cta_en:'Prevent zoonoses — vaccinate and stay cautious.', cta_gu:'ઝૂનોસિસ અટકાવો — રસી અપાવો અને સાવધ રહો.',
    hashtags:['WorldZoonosesDay','OneHealth','RabiesFree'], icon:'shield', category:'Health'
  },
  'world-rabies-day': {
    title_en:'World Rabies Day', title_gu:'વિશ્વ હડકવા દિવસ',
    importance_en:'Rabies is almost always fatal but entirely preventable through vaccination and wound care.',
    importance_gu:'હડકવા લગભગ હંમેશા જીવલેણ છે પણ રસી અને ઘાની સંભાળથી સંપૂર્ણપણે અટકાવી શકાય છે.',
    points_en:['Vaccinate dogs and pets against rabies','Wash any bite with soap and water','Get anti-rabies treatment without delay','Avoid provoking stray animals'],
    points_gu:['કૂતરા અને પાળતુ પ્રાણીઓને હડકવા રસી અપાવો','કોઈ પણ ડંખ સાબુ-પાણીથી ધોવો','વિલંબ વગર હડકવા વિરોધી સારવાર લો','રખડતા પ્રાણીઓને છંછેડવાનું ટાળો'],
    cta_en:'End rabies — vaccinate, wash, treat.', cta_gu:'હડકવા નાબૂદ કરો — રસી, ધોવો, સારવાર.',
    hashtags:['WorldRabiesDay','EndRabies','OneHealth'], icon:'shield', category:'Health'
  }
};
Object.assign(TOPIC_CONTENT, OFFICIAL_HEALTH_CONTENT);

// ---- Content library (BATCH 3a: movable-observance topics) ----
const MOVABLE_CONTENT = {
  'mothers-day': {
    title_en:"Mother's Day", title_gu:'માતૃ દિવસ',
    importance_en:'A day to honour mothers and mother figures for their love, care and sacrifice.',
    importance_gu:'માતાઓ અને માતૃસમાન વ્યક્તિઓના પ્રેમ, સંભાળ અને બલિદાનને સન્માન આપવાનો દિવસ.',
    points_en:['Spend quality time with your mother','Support mothers’ health and rest','Share household work fairly','Say thank you and show you care'],
    points_gu:['તમારી માતા સાથે ગુણવત્તાયુક્ત સમય વિતાવો','માતાઓના આરોગ્ય અને આરામને ટેકો આપો','ઘરકામ સમાનપણે વહેંચો','આભાર કહો અને કાળજી દર્શાવો'],
    cta_en:'Honour and care for the mothers in your life.', cta_gu:'તમારા જીવનની માતાઓને સન્માન અને સંભાળ આપો.',
    hashtags:['MothersDay','ThankYouMom','FamilyCare'], icon:'mom', category:'Family & Social'
  },
  'fathers-day': {
    title_en:"Father's Day", title_gu:'પિતૃ દિવસ',
    importance_en:'A day to appreciate fathers and father figures for their guidance and support.',
    importance_gu:'પિતાઓ અને પિતૃસમાન વ્યક્તિઓના માર્ગદર્શન અને સહારાની કદર કરવાનો દિવસ.',
    points_en:['Spend time with your father','Encourage fathers to look after their health','Share feelings and appreciation','Learn from their experience'],
    points_gu:['તમારા પિતા સાથે સમય વિતાવો','પિતાઓને તેમના આરોગ્યની સંભાળ લેવા પ્રોત્સાહિત કરો','લાગણી અને કદર વહેંચો','તેમના અનુભવમાંથી શીખો'],
    cta_en:'Celebrate and care for the fathers in your life.', cta_gu:'તમારા જીવનના પિતાઓની ઉજવણી અને સંભાળ કરો.',
    hashtags:['FathersDay','ThankYouDad','FamilyCare'], icon:'man', category:'Family & Social'
  },
  'world-kidney-day': {
    title_en:'World Kidney Day', title_gu:'વિશ્વ કિડની દિવસ',
    importance_en:'A global campaign to raise awareness of kidney health and reduce kidney disease.',
    importance_gu:'કિડની આરોગ્ય વિશે જાગૃતિ લાવવા અને કિડની રોગ ઘટાડવાની વૈશ્વિક ઝુંબેશ.',
    points_en:['Keep well hydrated','Control blood pressure and blood sugar','Eat less salt and avoid needless painkillers','Get kidney function tested if at risk'],
    points_gu:['સારી રીતે પાણી પીતા રહો','બ્લડપ્રેશર અને બ્લડ સુગર નિયંત્રિત કરો','ઓછું મીઠું ખાઓ અને બિનજરૂરી પેઈનકિલર ટાળો','જોખમ હોય તો કિડની કાર્ય તપાસાવો'],
    cta_en:'Keep your kidneys healthy — hydrate and check up.', cta_gu:'તમારી કિડની સ્વસ્થ રાખો — પાણી પીઓ અને તપાસ કરાવો.',
    hashtags:['WorldKidneyDay','KidneyHealth','KidneysMatter'], icon:'water', category:'Health'
  },
  'world-leprosy-day': {
    title_en:'World Leprosy Day', title_gu:'વિશ્વ રક્તપિત્ત દિવસ',
    importance_en:'Leprosy is curable with treatment; awareness ends stigma and supports early care.',
    importance_gu:'રક્તપિત્ત સારવારથી સાજો થાય છે; જાગૃતિ કલંક દૂર કરે છે અને વહેલી સંભાળને ટેકો આપે છે.',
    points_en:['Know that leprosy is curable','Watch for pale, numb skin patches','Seek free treatment early','Treat affected people with dignity'],
    points_gu:['જાણો કે રક્તપિત્ત સાજો થઈ શકે છે','ફિક્કા, સુન્ન ત્વચાના ડાઘ પર ધ્યાન આપો','વહેલી મફત સારવાર લો','પ્રભાવિત લોકોને ગૌરવથી વર્તો'],
    cta_en:'End leprosy stigma — early care cures.', cta_gu:'રક્તપિત્તનું કલંક દૂર કરો — વહેલી સંભાળ સાજો કરે છે.',
    hashtags:['WorldLeprosyDay','BeatLeprosy','EndStigma'], icon:'shield', category:'Health'
  }
};
Object.assign(TOPIC_CONTENT, MOVABLE_CONTENT);

// ---- Content library (BATCH 3b: remaining health + observance days) ----
const OFFICIAL_MIXED_CONTENT = {
  'national-deworming-day': {
    title_en:'National Deworming Day', title_gu:'રાષ્ટ્રીય કૃમિ નાબૂદી દિવસ',
    importance_en:'India deworms children to protect them from worm infections that harm growth and learning.',
    importance_gu:'ભારત બાળકોને કૃમિ ચેપથી બચાવવા કૃમિનાશક આપે છે જે વૃદ્ધિ અને શિક્ષણને નુકસાન કરે છે.',
    points_en:['Give deworming tablets as advised','Wash hands before eating','Wear footwear outdoors','Use clean toilets and water'],
    points_gu:['સલાહ મુજબ કૃમિનાશક ગોળી આપો','જમતાં પહેલાં હાથ ધોવો','બહાર જૂતાં પહેરો','સ્વચ્છ શૌચાલય અને પાણી વાપરો'],
    cta_en:'Deworm on time — help children grow healthy.', cta_gu:'સમયસર કૃમિનાશક આપો — બાળકોને સ્વસ્થ વધવામાં મદદ કરો.',
    hashtags:['DewormingDay','ChildHealth','WormFree'], icon:'child', category:'Health'
  },
  'world-population-day': {
    title_en:'World Population Day', title_gu:'વિશ્વ વસ્તી દિવસ',
    importance_en:'A UN day focusing on family planning, reproductive health and the rights of every person.',
    importance_gu:'કુટુંબ નિયોજન, પ્રજનન આરોગ્ય અને દરેક વ્યક્તિના અધિકારો પર કેન્દ્રિત UN દિવસ.',
    points_en:['Learn about family planning choices','Support access to reproductive health','Promote girls’ education','Ensure care for mothers and newborns'],
    points_gu:['કુટુંબ નિયોજનના વિકલ્પો જાણો','પ્રજનન આરોગ્યની ઉપલબ્ધતાને ટેકો આપો','બાળિકાઓના શિક્ષણને પ્રોત્સાહન આપો','માતા અને નવજાત માટે સંભાળ સુનિશ્ચિત કરો'],
    cta_en:'Empower choices — invest in reproductive health.', cta_gu:'પસંદગીઓને સશક્ત કરો — પ્રજનન આરોગ્યમાં રોકાણ કરો.',
    hashtags:['WorldPopulationDay','FamilyPlanning','ReproductiveHealth'], icon:'family', category:'Health'
  },
  'world-drowning-prevention-day': {
    title_en:'World Drowning Prevention Day', title_gu:'વિશ્વ ડૂબવા નિવારણ દિવસ',
    importance_en:'Drowning is preventable; supervision, barriers and rescue skills save lives.',
    importance_gu:'ડૂબવું અટકાવી શકાય છે; દેખરેખ, અવરોધો અને બચાવ કૌશલ્ય જીવન બચાવે છે.',
    points_en:['Always supervise children near water','Fence and cover wells and tanks','Learn swimming and rescue skills','Wear life jackets on boats'],
    points_gu:['પાણી નજીક બાળકો પર હંમેશા દેખરેખ રાખો','કૂવા અને ટાંકા ફેન્સ કરો અને ઢાંકો','તરવું અને બચાવ કૌશલ્ય શીખો','હોડીમાં લાઇફ જેકેટ પહેરો'],
    cta_en:'Prevent drowning — supervise, barrier, rescue.', cta_gu:'ડૂબવું અટકાવો — દેખરેખ, અવરોધ, બચાવ.',
    hashtags:['DrowningPrevention','WaterSafety','SaveLives'], icon:'water', category:'Health'
  },
  'world-lung-cancer-day': {
    title_en:'World Lung Cancer Day', title_gu:'વિશ્વ ફેફસાં કેન્સર દિવસ',
    importance_en:'Lung cancer awareness supports prevention, early detection and better outcomes.',
    importance_gu:'ફેફસાં કેન્સર જાગૃતિ નિવારણ, વહેલી તપાસ અને સારા પરિણામોને ટેકો આપે છે.',
    points_en:['Avoid tobacco and second-hand smoke','Reduce exposure to air pollution','Report a persistent cough or blood','Discuss screening if high risk'],
    points_gu:['તમાકુ અને પરોક્ષ ધુમાડો ટાળો','હવા પ્રદૂષણનો સંપર્ક ઘટાડો','સતત ખાંસી કે લોહી હોય તો જાણ કરો','વધુ જોખમ હોય તો સ્ક્રીનિંગ ચર્ચો'],
    cta_en:'Protect your lungs — avoid smoke, act on symptoms.', cta_gu:'તમારા ફેફસાંનું રક્ષણ કરો — ધુમાડો ટાળો, લક્ષણો પર પગલાં લો.',
    hashtags:['LungCancerDay','QuitSmoking','LungHealth'], icon:'leaf', category:'Health'
  },
  'world-pharmacists-day': {
    title_en:'World Pharmacists Day', title_gu:'વિશ્વ ફાર્માસિસ્ટ દિવસ',
    importance_en:'Pharmacists help people use medicines safely and support community health.',
    importance_gu:'ફાર્માસિસ્ટ લોકોને દવાઓ સલામત રીતે વાપરવામાં મદદ કરે છે અને સામુદાયિક આરોગ્યને ટેકો આપે છે.',
    points_en:['Ask your pharmacist about your medicines','Take medicines exactly as directed','Check expiry dates and storage','Never self-prescribe antibiotics'],
    points_gu:['તમારા ફાર્માસિસ્ટને દવાઓ વિશે પૂછો','દવાઓ સૂચના મુજબ બરાબર લો','સમાપ્તિ તારીખ અને સંગ્રહ તપાસો','એન્ટિબાયોટિક જાતે ક્યારેય ન લો'],
    cta_en:'Ask your pharmacist — use medicines safely.', cta_gu:'તમારા ફાર્માસિસ્ટને પૂછો — દવાઓ સલામત રીતે વાપરો.',
    hashtags:['WorldPharmacistsDay','SafeMedicines','Pharmacy'], icon:'cross', category:'Health'
  },
  'world-environmental-health-day': {
    title_en:'World Environmental Health Day', title_gu:'વિશ્વ પર્યાવરણીય આરોગ્ય દિવસ',
    importance_en:'Clean air, water and surroundings are the foundation of good health.',
    importance_gu:'સ્વચ્છ હવા, પાણી અને આસપાસ સારા આરોગ્યનો પાયો છે.',
    points_en:['Reduce pollution and waste','Keep water and food clean','Support clean cooking and air','Protect green and public spaces'],
    points_gu:['પ્રદૂષણ અને કચરો ઘટાડો','પાણી અને ખોરાક સ્વચ્છ રાખો','સ્વચ્છ રસોઈ અને હવાને ટેકો આપો','લીલી અને જાહેર જગ્યાઓનું રક્ષણ કરો'],
    cta_en:'Healthy environment, healthy people.', cta_gu:'સ્વસ્થ પર્યાવરણ, સ્વસ્થ લોકો.',
    hashtags:['EnvironmentalHealth','CleanEnvironment','OneHealth'], icon:'leaf', category:'Health & Environment'
  },
  'world-arthritis-day': {
    title_en:'World Arthritis Day', title_gu:'વિશ્વ સંધિવા દિવસ',
    importance_en:'Arthritis affects joints and movement; early care keeps people active and independent.',
    importance_gu:'સંધિવા સાંધા અને હલનચલનને અસર કરે છે; વહેલી સંભાળ લોકોને સક્રિય અને સ્વતંત્ર રાખે છે.',
    points_en:['Stay active with gentle exercise','Maintain a healthy weight','Seek early care for joint pain','Follow prescribed treatment'],
    points_gu:['હળવી કસરત સાથે સક્રિય રહો','સ્વસ્થ વજન જાળવો','સાંધાના દુખાવા માટે વહેલી સંભાળ લો','સૂચવેલ સારવાર અનુસરો'],
    cta_en:'Keep moving — care for your joints.', cta_gu:'હલનચલન ચાલુ રાખો — તમારા સાંધાની સંભાળ લો.',
    hashtags:['WorldArthritisDay','JointHealth','StayActive'], icon:'heart', category:'Health'
  },
  'world-osteoporosis-day': {
    title_en:'World Osteoporosis Day', title_gu:'વિશ્વ ઓસ્ટિયોપોરોસિસ દિવસ',
    importance_en:'Osteoporosis weakens bones silently; strong bones prevent fractures later in life.',
    importance_gu:'ઓસ્ટિયોપોરોસિસ મૌનપણે હાડકાં નબળાં કરે છે; મજબૂત હાડકાં પછીના જીવનમાં ફ્રેક્ચર અટકાવે છે.',
    points_en:['Eat calcium and vitamin-D rich foods','Get safe sunlight and exercise','Avoid smoking and excess alcohol','Prevent falls at home'],
    points_gu:['કેલ્શિયમ અને વિટામિન-ડી યુક્ત ખોરાક ખાઓ','સલામત તડકો અને કસરત મેળવો','ધૂમ્રપાન અને વધુ દારૂ ટાળો','ઘરમાં પડી જવાથી બચાવ કરો'],
    cta_en:'Build strong bones for life.', cta_gu:'જીવનભર માટે મજબૂત હાડકાં બનાવો.',
    hashtags:['WorldOsteoporosisDay','BoneHealth','StrongBones'], icon:'shield', category:'Health'
  },
  'world-autism-awareness-day': {
    title_en:'World Autism Awareness Day', title_gu:'વિશ્વ ઓટિઝમ જાગૃતિ દિવસ',
    importance_en:'A UN day promoting acceptance, support and inclusion for autistic people.',
    importance_gu:'ઓટિસ્ટિક લોકો માટે સ્વીકૃતિ, સહારો અને સમાવેશને પ્રોત્સાહન આપતો UN દિવસ.',
    points_en:['Learn about autism with an open mind','Support early identification and services','Make schools and spaces inclusive','Respect different ways of communicating'],
    points_gu:['ખુલ્લા મનથી ઓટિઝમ વિશે જાણો','વહેલી ઓળખ અને સેવાઓને ટેકો આપો','શાળા અને જગ્યાઓ સમાવેશક બનાવો','સંવાદની અલગ રીતોનું સન્માન કરો'],
    cta_en:'Accept, include and support autistic people.', cta_gu:'ઓટિસ્ટિક લોકોને સ્વીકારો, સામેલ કરો અને સહારો આપો.',
    hashtags:['WorldAutismDay','Inclusion','Acceptance'], icon:'brain', category:'Health & Inclusion'
  },
  'world-homeopathy-day': {
    title_en:'World Homeopathy Day', title_gu:'વિશ્વ હોમિયોપેથી દિવસ',
    importance_en:'Observed in India to reflect on homeopathy and safe, informed health choices.',
    importance_gu:'હોમિયોપેથી અને સલામત, જાણકાર આરોગ્ય પસંદગીઓ પર વિચાર કરવા ભારતમાં ઉજવાય છે.',
    points_en:['Consult qualified registered practitioners','Do not delay care for serious illness','Keep your doctor informed of all remedies','Rely on evidence for major decisions'],
    points_gu:['યોગ્ય નોંધાયેલ પ્રેક્ટિશનરની સલાહ લો','ગંભીર બીમારીમાં સંભાળ વિલંબિત ન કરો','બધા ઉપચાર વિશે તમારા ડૉક્ટરને જણાવો','મોટા નિર્ણયો પુરાવા પર આધારિત રાખો'],
    cta_en:'Make safe, informed health choices.', cta_gu:'સલામત, જાણકાર આરોગ્ય પસંદગીઓ કરો.',
    hashtags:['WorldHomeopathyDay','InformedChoices','Health'], icon:'cross', category:'Health'
  },
  'world-water-day': {
    title_en:'World Water Day', title_gu:'વિશ્વ જળ દિવસ',
    importance_en:'A UN day valuing water and the need to use and share it wisely.',
    importance_gu:'પાણીની કદર કરવા અને તેને સમજદારીથી વાપરવા-વહેંચવાની જરૂરિયાત માટેનો UN દિવસ.',
    points_en:['Save water in daily activities','Fix leaks and reuse water where safe','Keep water sources clean','Harvest rainwater where possible'],
    points_gu:['રોજિંદી પ્રવૃત્તિમાં પાણી બચાવો','લીકેજ સુધારો અને સલામત હોય ત્યાં પાણી પુનઃવાપરો','પાણીના સ્રોત સ્વચ્છ રાખો','શક્ય હોય ત્યાં વરસાદી પાણી સંગ્રહો'],
    cta_en:'Value every drop — save water today.', cta_gu:'દરેક ટીપાની કદર કરો — આજે પાણી બચાવો.',
    hashtags:['WorldWaterDay','SaveWater','WaterForAll'], icon:'water', category:'Environment'
  },
  'world-environment-day': {
    title_en:'World Environment Day', title_gu:'વિશ્વ પર્યાવરણ દિવસ',
    importance_en:'The UN’s biggest day for environmental action to protect nature and our future.',
    importance_gu:'પ્રકૃતિ અને આપણા ભવિષ્યના રક્ષણ માટે પર્યાવરણીય પગલાં માટેનો UNનો સૌથી મોટો દિવસ.',
    points_en:['Plant and protect trees','Reduce, reuse and recycle','Cut single-use plastic','Save energy and water'],
    points_gu:['વૃક્ષો રોપો અને રક્ષણ કરો','ઘટાડો, પુનઃવાપરો અને રિસાયકલ કરો','એક-વારના પ્લાસ્ટિકનો ઉપયોગ ઘટાડો','ઊર્જા અને પાણી બચાવો'],
    cta_en:'Act for nature — protect our only planet.', cta_gu:'પ્રકૃતિ માટે પગલાં લો — આપણી એકમાત્ર ધરતીનું રક્ષણ કરો.',
    hashtags:['WorldEnvironmentDay','ForNature','BeatPollution'], icon:'leaf', category:'Environment'
  },
  'earth-day': {
    title_en:'Earth Day', title_gu:'પૃથ્વી દિવસ',
    importance_en:'A global day to support environmental protection and a healthy planet.',
    importance_gu:'પર્યાવરણ સંરક્ષણ અને સ્વસ્થ ધરતીને ટેકો આપવા માટેનો વૈશ્વિક દિવસ.',
    points_en:['Reduce your carbon footprint','Choose reusable over disposable','Support clean energy','Join a local clean-up or tree drive'],
    points_gu:['તમારું કાર્બન ફૂટપ્રિન્ટ ઘટાડો','નિકાલપાત્રને બદલે પુનઃવાપરી શકાય તે પસંદ કરો','સ્વચ્છ ઊર્જાને ટેકો આપો','સ્થાનિક સફાઈ કે વૃક્ષારોપણમાં જોડાઓ'],
    cta_en:'Invest in our planet — every day is Earth Day.', cta_gu:'આપણી ધરતીમાં રોકાણ કરો — દરેક દિવસ પૃથ્વી દિવસ છે.',
    hashtags:['EarthDay','ProtectOurPlanet','ClimateAction'], icon:'globe', category:'Environment'
  },
  'world-oceans-day': {
    title_en:'World Oceans Day', title_gu:'વિશ્વ મહાસાગર દિવસ',
    importance_en:'A UN day celebrating the ocean and our duty to keep it healthy.',
    importance_gu:'મહાસાગરની ઉજવણી અને તેને સ્વસ્થ રાખવાની આપણી ફરજ માટેનો UN દિવસ.',
    points_en:['Cut down on plastic use','Dispose of waste responsibly','Support clean rivers and coasts','Choose sustainable seafood'],
    points_gu:['પ્લાસ્ટિકનો ઉપયોગ ઘટાડો','કચરાનો જવાબદારીપૂર્વક નિકાલ કરો','સ્વચ્છ નદીઓ અને દરિયાકાંઠાને ટેકો આપો','ટકાઉ સીફૂડ પસંદ કરો'],
    cta_en:'Protect our ocean — it protects us.', cta_gu:'આપણા મહાસાગરનું રક્ષણ કરો — તે આપણું રક્ષણ કરે છે.',
    hashtags:['WorldOceansDay','SaveOurOcean','CleanSeas'], icon:'water', category:'Environment'
  },
  'world-wetlands-day': {
    title_en:'World Wetlands Day', title_gu:'વિશ્વ ભૂમિપ્રદેશ (વેટલૅન્ડ) દિવસ',
    importance_en:'Wetlands clean water, prevent floods and support wildlife and livelihoods.',
    importance_gu:'ભીની ભૂમિ પાણી સાફ કરે છે, પૂર અટકાવે છે અને વન્યજીવન તથા આજીવિકાને ટેકો આપે છે.',
    points_en:['Protect local ponds and marshes','Avoid dumping waste in water bodies','Support wetland conservation','Value wetlands as natural filters'],
    points_gu:['સ્થાનિક તળાવ અને કળણનું રક્ષણ કરો','જળાશયોમાં કચરો નાખવાનું ટાળો','ભીની ભૂમિ સંરક્ષણને ટેકો આપો','ભીની ભૂમિને કુદરતી ફિલ્ટર તરીકે મૂલવો'],
    cta_en:'Protect wetlands — nature’s water guardians.', cta_gu:'ભીની ભૂમિનું રક્ષણ કરો — પ્રકૃતિના જળરક્ષક.',
    hashtags:['WorldWetlandsDay','SaveWetlands','Nature'], icon:'water', category:'Environment'
  },
  'world-soil-day': {
    title_en:'World Soil Day', title_gu:'વિશ્વ મૃદા દિવસ',
    importance_en:'Healthy soil grows our food and supports life; caring for it protects future harvests.',
    importance_gu:'સ્વસ્થ માટી આપણો ખોરાક ઉગાડે છે અને જીવનને ટેકો આપે છે; તેની સંભાળ ભવિષ્યની ફસલોનું રક્ષણ કરે છે.',
    points_en:['Reduce chemical overuse on farms','Add compost and organic matter','Prevent soil erosion','Support sustainable farming'],
    points_gu:['ખેતરોમાં રસાયણનો વધુ ઉપયોગ ઘટાડો','કમ્પોસ્ટ અને સેન્દ્રિય પદાર્થ ઉમેરો','માટીનું ધોવાણ અટકાવો','ટકાઉ ખેતીને ટેકો આપો'],
    cta_en:'Care for the soil that feeds us all.', cta_gu:'આપણને પોષતી માટીની સંભાળ લો.',
    hashtags:['WorldSoilDay','HealthySoil','Sustainability'], icon:'plant', category:'Environment & Agriculture'
  },
  'international-yoga-day': {
    title_en:'International Day of Yoga', title_gu:'આંતરરાષ્ટ્રીય યોગ દિવસ',
    importance_en:'A UN day promoting yoga for physical, mental and holistic wellbeing.',
    importance_gu:'શારીરિક, માનસિક અને સર્વાંગી સુખાકારી માટે યોગને પ્રોત્સાહન આપતો UN દિવસ.',
    points_en:['Practise yoga a little each day','Breathe slowly and mindfully','Learn correct posture from a teacher','Combine yoga with a balanced life'],
    points_gu:['દરરોજ થોડો યોગ કરો','ધીમે અને ધ્યાનપૂર્વક શ્વાસ લો','શિક્ષક પાસેથી સાચી મુદ્રા શીખો','યોગને સંતુલિત જીવન સાથે જોડો'],
    cta_en:'Roll out your mat — practise yoga today.', cta_gu:'તમારી ચટાઈ પાથરો — આજે યોગ કરો.',
    hashtags:['YogaDay','InternationalYogaDay','YogaForHealth'], icon:'brain', category:'Health'
  },
  'republic-day': {
    title_en:'Republic Day', title_gu:'પ્રજાસત્તાક દિવસ',
    importance_en:'India marks the day its Constitution came into force in 1950.',
    importance_gu:'ભારત 1950માં તેનું બંધારણ અમલમાં આવ્યાનો દિવસ ઉજવે છે.',
    points_en:['Honour the Constitution and its values','Know your rights and duties','Respect diversity and unity','Contribute to the nation’s progress'],
    points_gu:['બંધારણ અને તેના મૂલ્યોનું સન્માન કરો','તમારા અધિકારો અને ફરજો જાણો','વિવિધતા અને એકતાનું સન્માન કરો','રાષ્ટ્રની પ્રગતિમાં યોગદાન આપો'],
    cta_en:'Celebrate the Republic — uphold its values.', cta_gu:'પ્રજાસત્તાકની ઉજવણી કરો — તેના મૂલ્યો જાળવો.',
    hashtags:['RepublicDay','ProudIndian','Constitution'], icon:'flag', category:'National'
  },
  'independence-day': {
    title_en:'Independence Day', title_gu:'સ્વતંત્રતા દિવસ',
    importance_en:'India celebrates freedom won in 1947 and honours those who made it possible.',
    importance_gu:'ભારત 1947માં મળેલી સ્વતંત્રતાની ઉજવણી કરે છે અને તેને શક્ય બનાવનારાઓને સન્માન આપે છે.',
    points_en:['Remember the freedom struggle','Honour the national flag respectfully','Serve your community and country','Uphold unity and responsibility'],
    points_gu:['સ્વતંત્રતા સંગ્રામને યાદ કરો','રાષ્ટ્રધ્વજને આદરપૂર્વક સન્માન આપો','તમારા સમુદાય અને દેશની સેવા કરો','એકતા અને જવાબદારી જાળવો'],
    cta_en:'Celebrate freedom — serve the nation.', cta_gu:'સ્વતંત્રતાની ઉજવણી કરો — રાષ્ટ્રની સેવા કરો.',
    hashtags:['IndependenceDay','ProudIndian','Freedom'], icon:'flag', category:'National'
  },
  'gandhi-jayanti': {
    title_en:'Gandhi Jayanti / International Day of Non-Violence', title_gu:'ગાંધી જયંતિ / આંતરરાષ્ટ્રીય અહિંસા દિવસ',
    importance_en:'Marks Mahatma Gandhi’s birth and the global message of non-violence.',
    importance_gu:'મહાત્મા ગાંધીના જન્મ અને અહિંસાના વૈશ્વિક સંદેશની યાદ અપાવે છે.',
    points_en:['Choose peace over conflict','Practise truth and honesty','Serve others selflessly','Keep your surroundings clean'],
    points_gu:['સંઘર્ષ કરતાં શાંતિ પસંદ કરો','સત્ય અને પ્રામાણિકતાનો અભ્યાસ કરો','નિઃસ્વાર્થપણે અન્યની સેવા કરો','તમારી આસપાસ સ્વચ્છ રાખો'],
    cta_en:'Live Gandhi’s values — truth and non-violence.', cta_gu:'ગાંધીના મૂલ્યો જીવો — સત્ય અને અહિંસા.',
    hashtags:['GandhiJayanti','NonViolence','Peace'], icon:'peace', category:'National & Peace'
  },
  'international-womens-day': {
    title_en:"International Women's Day", title_gu:'આંતરરાષ્ટ્રીય મહિલા દિવસ',
    importance_en:'A global day celebrating women’s achievements and calling for equality.',
    importance_gu:'મહિલાઓની સિદ્ધિઓની ઉજવણી કરતો અને સમાનતાની હાકલ કરતો વૈશ્વિક દિવસ.',
    points_en:['Support equal opportunity for women','Respect women’s health and choices','Challenge bias and discrimination','Encourage girls’ education and leadership'],
    points_gu:['મહિલાઓ માટે સમાન તકને ટેકો આપો','મહિલાઓના આરોગ્ય અને પસંદગીનું સન્માન કરો','પક્ષપાત અને ભેદભાવને પડકારો','બાળિકાઓના શિક્ષણ અને નેતૃત્વને પ્રોત્સાહન આપો'],
    cta_en:'Advance equality — support women every day.', cta_gu:'સમાનતાને આગળ વધારો — દરરોજ મહિલાઓને ટેકો આપો.',
    hashtags:['InternationalWomensDay','GenderEquality','IWD'], icon:'woman', category:'Health & Social'
  },
  'world-food-day': {
    title_en:'World Food Day', title_gu:'વિશ્વ ખાદ્ય દિવસ',
    importance_en:'A UN day for the right to safe, nutritious food and against hunger and waste.',
    importance_gu:'સલામત, પૌષ્ટિક ખોરાકના અધિકાર અને ભૂખ તથા બગાડ સામેનો UN દિવસ.',
    points_en:['Do not waste food','Eat diverse, nutritious meals','Support local farmers','Share food with those in need'],
    points_gu:['ખોરાકનો બગાડ ન કરો','વૈવિધ્યસભર, પૌષ્ટિક ભોજન લો','સ્થાનિક ખેડૂતોને ટેકો આપો','જરૂરિયાતમંદો સાથે ખોરાક વહેંચો'],
    cta_en:'Leave no one behind — value food, end hunger.', cta_gu:'કોઈને પાછળ ન છોડો — ખોરાકની કદર કરો, ભૂખ મિટાવો.',
    hashtags:['WorldFoodDay','ZeroHunger','FoodForAll'], icon:'apple', category:'Health & Nutrition'
  },
  'international-day-persons-disabilities': {
    title_en:'International Day of Persons with Disabilities', title_gu:'આંતરરાષ્ટ્રીય વિકલાંગ વ્યક્તિ દિવસ',
    importance_en:'A UN day promoting the rights, inclusion and wellbeing of persons with disabilities.',
    importance_gu:'વિકલાંગ વ્યક્તિઓના અધિકારો, સમાવેશ અને સુખાકારીને પ્રોત્સાહન આપતો UN દિવસ.',
    points_en:['Make spaces accessible for all','Include persons with disabilities fully','Respect dignity and independence','Support assistive care and services'],
    points_gu:['બધા માટે જગ્યાઓ સુલભ બનાવો','વિકલાંગ વ્યક્તિઓને સંપૂર્ણપણે સામેલ કરો','ગૌરવ અને સ્વતંત્રતાનું સન્માન કરો','સહાયક સંભાળ અને સેવાઓને ટેકો આપો'],
    cta_en:'Build an inclusive world for everyone.', cta_gu:'દરેક માટે સમાવેશક દુનિયા બનાવો.',
    hashtags:['IDPWD','Inclusion','DisabilityRights'], icon:'heart', category:'Health & Inclusion'
  }
};
Object.assign(TOPIC_CONTENT, OFFICIAL_MIXED_CONTENT);

// ---- Content library (BATCH 4: national + international observances) ----
const OFFICIAL_CIVIC_CONTENT = {
  'pravasi-bharatiya-divas': {
    title_en:'Pravasi Bharatiya Divas', title_gu:'પ્રવાસી ભારતીય દિવસ',
    importance_en:'India honours the contribution of its overseas community to the nation.',
    importance_gu:'ભારત તેના વિદેશવાસી સમુદાયના રાષ્ટ્ર પ્રત્યેના યોગદાનને સન્માન આપે છે.',
    points_en:['Value the diaspora’s contribution','Stay connected to your roots','Support development back home','Share knowledge across borders'],
    points_gu:['ડાયસ્પોરાના યોગદાનની કદર કરો','તમારા મૂળ સાથે જોડાયેલા રહો','વતનમાં વિકાસને ટેકો આપો','સરહદો પાર જ્ઞાન વહેંચો'],
    cta_en:'Honour the global Indian family.', cta_gu:'વૈશ્વિક ભારતીય પરિવારને સન્માન આપો.',
    hashtags:['PravasiBharatiyaDivas','Diaspora','ProudIndian'], icon:'globe', category:'National'
  },
  'national-youth-day': {
    title_en:'National Youth Day', title_gu:'રાષ્ટ્રીય યુવા દિવસ',
    importance_en:'Marked on Swami Vivekananda’s birthday to inspire the energy and ideals of youth.',
    importance_gu:'યુવાનોની ઊર્જા અને આદર્શોને પ્રેરિત કરવા સ્વામી વિવેકાનંદના જન્મદિને ઉજવાય છે.',
    points_en:['Set goals and keep learning','Serve your community','Stay physically and mentally fit','Lead with confidence and values'],
    points_gu:['લક્ષ્યો નક્કી કરો અને શીખતા રહો','તમારા સમુદાયની સેવા કરો','શારીરિક અને માનસિક રીતે તંદુરસ્ત રહો','આત્મવિશ્વાસ અને મૂલ્યો સાથે નેતૃત્વ કરો'],
    cta_en:'Arise, awake — youth power builds the nation.', cta_gu:'ઊઠો, જાગો — યુવા શક્તિ રાષ્ટ્ર ઘડે છે.',
    hashtags:['NationalYouthDay','YouthPower','Vivekananda'], icon:'teen', category:'National'
  },
  'national-girl-child-day': {
    title_en:'National Girl Child Day', title_gu:'રાષ્ટ્રીય બાળિકા દિવસ',
    importance_en:'India promotes the rights, health and education of the girl child.',
    importance_gu:'ભારત બાળિકાના અધિકારો, આરોગ્ય અને શિક્ષણને પ્રોત્સાહન આપે છે.',
    points_en:['Ensure girls go to school','Protect girls’ health and nutrition','Say no to gender discrimination','Support girls’ dreams and safety'],
    points_gu:['બાળિકાઓ શાળાએ જાય તે સુનિશ્ચિત કરો','બાળિકાઓના આરોગ્ય અને પોષણનું રક્ષણ કરો','લિંગ ભેદભાવને ના કહો','બાળિકાઓના સપના અને સલામતીને ટેકો આપો'],
    cta_en:'Empower every girl child.', cta_gu:'દરેક બાળિકાને સશક્ત બનાવો.',
    hashtags:['NationalGirlChildDay','BetiBachaoBetiPadhao','GirlPower'], icon:'child', category:'Health & Social'
  },
  'national-voters-day': {
    title_en:"National Voters' Day", title_gu:'રાષ્ટ્રીય મતદાતા દિવસ',
    importance_en:'India encourages every eligible citizen to register and vote.',
    importance_gu:'ભારત દરેક પાત્ર નાગરિકને નોંધણી કરાવવા અને મત આપવા પ્રોત્સાહિત કરે છે.',
    points_en:['Register as a voter','Vote in every election','Make an informed choice','Encourage others to vote'],
    points_gu:['મતદાતા તરીકે નોંધણી કરાવો','દરેક ચૂંટણીમાં મત આપો','જાણકાર પસંદગી કરો','અન્યને મત આપવા પ્રોત્સાહિત કરો'],
    cta_en:'Your vote, your voice — use it.', cta_gu:'તમારો મત, તમારો અવાજ — તેનો ઉપયોગ કરો.',
    hashtags:['NationalVotersDay','MyVoteMyRight','Democracy'], icon:'building', category:'National'
  },
  'national-science-day': {
    title_en:'National Science Day', title_gu:'રાષ્ટ્રીય વિજ્ઞાન દિવસ',
    importance_en:'India celebrates science and the spirit of curiosity and discovery.',
    importance_gu:'ભારત વિજ્ઞાન અને જિજ્ઞાસા તથા શોધની ભાવનાની ઉજવણી કરે છે.',
    points_en:['Ask questions and seek evidence','Encourage scientific thinking','Support students in science','Use science for everyday problems'],
    points_gu:['પ્રશ્નો પૂછો અને પુરાવો શોધો','વૈજ્ઞાનિક વિચારને પ્રોત્સાહન આપો','વિજ્ઞાનમાં વિદ્યાર્થીઓને ટેકો આપો','રોજિંદી સમસ્યાઓ માટે વિજ્ઞાન વાપરો'],
    cta_en:'Think scientifically — question and discover.', cta_gu:'વૈજ્ઞાનિક રીતે વિચારો — પ્રશ્ન કરો અને શોધો.',
    hashtags:['NationalScienceDay','ScienceForAll','Curiosity'], icon:'atom', category:'National & Science'
  },
  'ambedkar-jayanti': {
    title_en:'Dr. B. R. Ambedkar Jayanti', title_gu:'ડૉ. બી. આર. આંબેડકર જયંતિ',
    importance_en:'India honours the architect of its Constitution and champion of equality.',
    importance_gu:'ભારત તેના બંધારણના શિલ્પી અને સમાનતાના પ્રણેતાને સન્માન આપે છે.',
    points_en:['Uphold equality and justice','Value education as empowerment','Reject caste and discrimination','Know your constitutional rights'],
    points_gu:['સમાનતા અને ન્યાય જાળવો','શિક્ષણને સશક્તિકરણ તરીકે મૂલવો','જાતિ અને ભેદભાવને નકારો','તમારા બંધારણીય અધિકારો જાણો'],
    cta_en:'Educate, agitate, organise — for equality.', cta_gu:'શિક્ષિત બનો, સંગઠિત થાઓ — સમાનતા માટે.',
    hashtags:['AmbedkarJayanti','Equality','Constitution'], icon:'scales', category:'National'
  },
  'teachers-day': {
    title_en:"Teachers' Day", title_gu:'શિક્ષક દિવસ',
    importance_en:'India honours teachers on Dr. Radhakrishnan’s birthday for shaping minds and futures.',
    importance_gu:'ભારત મન અને ભવિષ્ય ઘડવા બદલ ડૉ. રાધાકૃષ્ણનના જન્મદિને શિક્ષકોને સન્માન આપે છે.',
    points_en:['Thank your teachers','Value lifelong learning','Support quality education for all','Respect those who guide us'],
    points_gu:['તમારા શિક્ષકોનો આભાર માનો','જીવનભરના શિક્ષણને મૂલવો','બધા માટે ગુણવત્તાયુક્ત શિક્ષણને ટેકો આપો','આપણને માર્ગદર્શન આપનારાઓનું સન્માન કરો'],
    cta_en:'Thank a teacher who shaped your life.', cta_gu:'તમારું જીવન ઘડનાર શિક્ષકનો આભાર માનો.',
    hashtags:['TeachersDay','ThankYouTeacher','Education'], icon:'cap', category:'National & Education'
  },
  'hindi-diwas': {
    title_en:'Hindi Diwas', title_gu:'હિન્દી દિવસ',
    importance_en:'India celebrates the Hindi language and its role in national life.',
    importance_gu:'ભારત હિન્દી ભાષા અને રાષ્ટ્રીય જીવનમાં તેની ભૂમિકાની ઉજવણી કરે છે.',
    points_en:['Take pride in your languages','Read and write in Hindi','Respect India’s many languages','Pass language to the next generation'],
    points_gu:['તમારી ભાષાઓ પર ગર્વ કરો','હિન્દીમાં વાંચો અને લખો','ભારતની અનેક ભાષાઓનું સન્માન કરો','ભાષા આવનારી પેઢીને આપો'],
    cta_en:'Celebrate language — read and write with pride.', cta_gu:'ભાષાની ઉજવણી કરો — ગર્વથી વાંચો અને લખો.',
    hashtags:['HindiDiwas','Language','ProudIndian'], icon:'book', category:'National & Language'
  },
  'engineers-day': {
    title_en:"Engineers' Day", title_gu:'ઇજનેર દિવસ',
    importance_en:'India honours engineers on Sir M. Visvesvaraya’s birthday for building the nation.',
    importance_gu:'ભારત રાષ્ટ્ર નિર્માણ બદલ સર એમ. વિશ્વેશ્વરૈયાના જન્મદિને ઇજનેરોને સન્માન આપે છે.',
    points_en:['Value innovation and problem-solving','Build safe and sustainable solutions','Encourage youth in engineering','Respect the makers behind progress'],
    points_gu:['નવીનતા અને સમસ્યા-ઉકેલને મૂલવો','સલામત અને ટકાઉ ઉકેલો બનાવો','યુવાનોને ઇજનેરીમાં પ્રોત્સાહિત કરો','પ્રગતિ પાછળના નિર્માતાઓનું સન્માન કરો'],
    cta_en:'Celebrate engineers who build our world.', cta_gu:'આપણી દુનિયા ઘડનાર ઇજનેરોની ઉજવણી કરો.',
    hashtags:['EngineersDay','Innovation','Visvesvaraya'], icon:'atom', category:'National & Science'
  },
  'national-unity-day': {
    title_en:'National Unity Day', title_gu:'રાષ્ટ્રીય એકતા દિવસ',
    importance_en:'Marks Sardar Patel’s birthday and the value of a united India.',
    importance_gu:'સરદાર પટેલના જન્મદિન અને એકજૂટ ભારતના મૂલ્યની યાદ અપાવે છે.',
    points_en:['Stand for national unity','Respect all communities','Resolve differences peacefully','Serve the country together'],
    points_gu:['રાષ્ટ્રીય એકતા માટે ઊભા રહો','બધા સમુદાયોનું સન્માન કરો','મતભેદો શાંતિપૂર્ણ રીતે ઉકેલો','સાથે મળી દેશની સેવા કરો'],
    cta_en:'United we stand — strengthen the nation.', cta_gu:'એકતામાં આપણી શક્તિ — રાષ્ટ્રને મજબૂત કરો.',
    hashtags:['NationalUnityDay','EkBharat','Unity'], icon:'flag', category:'National'
  },
  'constitution-day': {
    title_en:'Constitution Day', title_gu:'બંધારણ દિવસ',
    importance_en:'India marks the adoption of its Constitution and the values it upholds.',
    importance_gu:'ભારત તેના બંધારણ સ્વીકાર અને તે જાળવતા મૂલ્યોની યાદ કરે છે.',
    points_en:['Know your rights and duties','Uphold justice and equality','Respect the rule of law','Participate in democracy'],
    points_gu:['તમારા અધિકારો અને ફરજો જાણો','ન્યાય અને સમાનતા જાળવો','કાયદાના શાસનનું સન્માન કરો','લોકશાહીમાં ભાગ લો'],
    cta_en:'Know and honour your Constitution.', cta_gu:'તમારા બંધારણને જાણો અને સન્માન આપો.',
    hashtags:['ConstitutionDay','SamvidhanDivas','Democracy'], icon:'scales', category:'National'
  },
  'national-mathematics-day': {
    title_en:'National Mathematics Day', title_gu:'રાષ્ટ્રીય ગણિત દિવસ',
    importance_en:'Marks Srinivasa Ramanujan’s birthday and the beauty of mathematics.',
    importance_gu:'શ્રીનિવાસ રામાનુજનના જન્મદિન અને ગણિતના સૌંદર્યની યાદ અપાવે છે.',
    points_en:['Enjoy solving problems','Build strong number skills','Encourage students in maths','Use maths in daily life'],
    points_gu:['સમસ્યાઓ ઉકેલવાનો આનંદ લો','મજબૂત ગણન કૌશલ્ય બનાવો','વિદ્યાર્થીઓને ગણિતમાં પ્રોત્સાહિત કરો','રોજિંદા જીવનમાં ગણિત વાપરો'],
    cta_en:'Celebrate the joy of mathematics.', cta_gu:'ગણિતના આનંદની ઉજવણી કરો.',
    hashtags:['NationalMathematicsDay','Ramanujan','MathsForAll'], icon:'atom', category:'National & Education'
  },
  'kisan-diwas': {
    title_en:"Kisan Diwas / National Farmers' Day", title_gu:'કિસાન દિવસ / રાષ્ટ્રીય ખેડૂત દિવસ',
    importance_en:'India honours farmers who feed the nation and sustain rural life.',
    importance_gu:'ભારત રાષ્ટ્રને અન્ન આપતા અને ગ્રામીણ જીવન ટકાવતા ખેડૂતોને સન્માન આપે છે.',
    points_en:['Respect and support farmers','Reduce food waste','Choose local, seasonal produce','Promote sustainable farming'],
    points_gu:['ખેડૂતોનું સન્માન કરો અને ટેકો આપો','ખોરાકનો બગાડ ઘટાડો','સ્થાનિક, મોસમી ઉપજ પસંદ કરો','ટકાઉ ખેતીને પ્રોત્સાહન આપો'],
    cta_en:'Honour farmers — respect the hands that feed us.', cta_gu:'ખેડૂતોને સન્માન આપો — આપણને પોષતા હાથોનું સન્માન કરો.',
    hashtags:['KisanDiwas','FarmersDay','Agriculture'], icon:'plant', category:'National & Agriculture'
  },
  'national-consumer-day': {
    title_en:'National Consumer Day', title_gu:'રાષ્ટ્રીય ઉપભોક્તા દિવસ',
    importance_en:'India promotes consumer rights and protection against unfair trade.',
    importance_gu:'ભારત ઉપભોક્તા અધિકારો અને અન્યાયી વેપાર સામે રક્ષણને પ્રોત્સાહન આપે છે.',
    points_en:['Know your consumer rights','Check labels, prices and dates','Keep bills and warranties','Report unfair practices'],
    points_gu:['તમારા ઉપભોક્તા અધિકારો જાણો','લેબલ, ભાવ અને તારીખ તપાસો','બિલ અને વોરંટી રાખો','અન્યાયી પ્રથાઓની જાણ કરો'],
    cta_en:'Be a smart consumer — know your rights.', cta_gu:'સ્માર્ટ ઉપભોક્તા બનો — તમારા અધિકારો જાણો.',
    hashtags:['ConsumerDay','ConsumerRights','JagoGrahakJago'], icon:'cart', category:'National & Consumer Affairs'
  },
  'national-energy-conservation-day': {
    title_en:'National Energy Conservation Day', title_gu:'રાષ્ટ્રીય ઊર્જા સંરક્ષણ દિવસ',
    importance_en:'India promotes saving energy for a cleaner, more secure future.',
    importance_gu:'ભારત સ્વચ્છ, વધુ સુરક્ષિત ભવિષ્ય માટે ઊર્જા બચતને પ્રોત્સાહન આપે છે.',
    points_en:['Switch off unused lights and devices','Use energy-efficient appliances','Prefer public or shared transport','Support clean, renewable energy'],
    points_gu:['ન વપરાતી લાઇટ અને ઉપકરણો બંધ કરો','ઊર્જા-કાર્યક્ષમ ઉપકરણો વાપરો','જાહેર કે સહિયારા પરિવહનને પ્રાધાન્ય આપો','સ્વચ્છ, નવીનીકરણીય ઊર્જાને ટેકો આપો'],
    cta_en:'Save energy — power a cleaner future.', cta_gu:'ઊર્જા બચાવો — સ્વચ્છ ભવિષ્યને શક્તિ આપો.',
    hashtags:['EnergyConservation','SaveEnergy','CleanEnergy'], icon:'sun', category:'Environment & Energy'
  },
  'world-braille-day': {
    title_en:'World Braille Day', title_gu:'વિશ્વ બ્રેઇલ દિવસ',
    importance_en:'A UN day recognising braille as vital for the rights and inclusion of blind people.',
    importance_gu:'અંધ લોકોના અધિકારો અને સમાવેશ માટે બ્રેઇલને મહત્વપૂર્ણ ગણતો UN દિવસ.',
    points_en:['Support access to braille materials','Make information accessible to all','Include people with vision loss','Respect independence and dignity'],
    points_gu:['બ્રેઇલ સામગ્રીની ઉપલબ્ધતાને ટેકો આપો','માહિતી બધા માટે સુલભ બનાવો','દૃષ્ટિહીન લોકોને સામેલ કરો','સ્વતંત્રતા અને ગૌરવનું સન્માન કરો'],
    cta_en:'Make the world accessible — support braille.', cta_gu:'દુનિયાને સુલભ બનાવો — બ્રેઇલને ટેકો આપો.',
    hashtags:['WorldBrailleDay','Accessibility','Inclusion'], icon:'book', category:'Health & Inclusion'
  },
  'international-mother-language-day': {
    title_en:'International Mother Language Day', title_gu:'આંતરરાષ્ટ્રીય માતૃભાષા દિવસ',
    importance_en:'A UNESCO day celebrating linguistic diversity and mother tongues.',
    importance_gu:'ભાષાકીય વિવિધતા અને માતૃભાષાઓની ઉજવણી કરતો UNESCO દિવસ.',
    points_en:['Speak and cherish your mother tongue','Pass language to children','Respect all languages','Support multilingual learning'],
    points_gu:['તમારી માતૃભાષા બોલો અને જાળવો','ભાષા બાળકોને આપો','બધી ભાષાઓનું સન્માન કરો','બહુભાષી શિક્ષણને ટેકો આપો'],
    cta_en:'Cherish your mother tongue.', cta_gu:'તમારી માતૃભાષાને જાળવો.',
    hashtags:['MotherLanguageDay','LinguisticDiversity','Language'], icon:'language', category:'Language & Culture'
  },
  'zero-discrimination-day': {
    title_en:'Zero Discrimination Day', title_gu:'શૂન્ય ભેદભાવ દિવસ',
    importance_en:'A UN day for the right of everyone to live with dignity, free of discrimination.',
    importance_gu:'દરેકના ગૌરવ સાથે, ભેદભાવ વગર જીવવાના અધિકાર માટેનો UN દિવસ.',
    points_en:['Treat everyone with respect','Challenge stigma and bias','Support equal access to care','Stand up for those excluded'],
    points_gu:['દરેકને આદરથી વર્તો','કલંક અને પક્ષપાતને પડકારો','સંભાળની સમાન ઉપલબ્ધતાને ટેકો આપો','બાકાત રખાયેલા માટે ઊભા રહો'],
    cta_en:'Zero discrimination — dignity for all.', cta_gu:'શૂન્ય ભેદભાવ — બધા માટે ગૌરવ.',
    hashtags:['ZeroDiscriminationDay','Equality','Dignity'], icon:'heart', category:'Health & Rights'
  },
  'world-consumer-rights-day': {
    title_en:'World Consumer Rights Day', title_gu:'વિશ્વ ઉપભોક્તા અધિકાર દિવસ',
    importance_en:'A global day for fair, safe and honest treatment of consumers.',
    importance_gu:'ઉપભોક્તાઓ સાથે ન્યાયી, સલામત અને પ્રામાણિક વર્તન માટેનો વૈશ્વિક દિવસ.',
    points_en:['Know your rights as a consumer','Demand safe products and services','Read terms before you buy','Report fraud and unfair practices'],
    points_gu:['ઉપભોક્તા તરીકે તમારા અધિકારો જાણો','સલામત ઉત્પાદનો અને સેવાઓની માંગ કરો','ખરીદતાં પહેલાં શરતો વાંચો','છેતરપિંડી અને અન્યાયી પ્રથાઓની જાણ કરો'],
    cta_en:'Know your rights — shop safe and smart.', cta_gu:'તમારા અધિકારો જાણો — સલામત અને સ્માર્ટ ખરીદો.',
    hashtags:['ConsumerRightsDay','ConsumerRights','ShopSmart'], icon:'cart', category:'Consumer Affairs'
  },
  'world-press-freedom-day': {
    title_en:'World Press Freedom Day', title_gu:'વિશ્વ પ્રેસ સ્વતંત્રતા દિવસ',
    importance_en:'A UN day defending a free press and the public’s right to know.',
    importance_gu:'સ્વતંત્ર પ્રેસ અને જનતાના જાણવાના અધિકારના બચાવ માટેનો UN દિવસ.',
    points_en:['Support independent journalism','Check facts before sharing','Reject misinformation','Protect journalists’ safety'],
    points_gu:['સ્વતંત્ર પત્રકારત્વને ટેકો આપો','શેર કરતાં પહેલાં હકીકતો તપાસો','ખોટી માહિતીને નકારો','પત્રકારોની સલામતીનું રક્ષણ કરો'],
    cta_en:'Defend a free press — value the truth.', cta_gu:'સ્વતંત્ર પ્રેસનો બચાવ કરો — સત્યની કદર કરો.',
    hashtags:['PressFreedom','FreePress','Journalism'], icon:'news', category:'Media'
  },
  'red-cross-day': {
    title_en:'World Red Cross and Red Crescent Day', title_gu:'વિશ્વ રેડ ક્રોસ અને રેડ ક્રેસન્ટ દિવસ',
    importance_en:'Honours humanitarian volunteers who help people in crisis worldwide.',
    importance_gu:'સંકટમાં લોકોને મદદ કરતા માનવતાવાદી સ્વયંસેવકોને સન્માન આપે છે.',
    points_en:['Support humanitarian work','Volunteer and donate blood','Learn basic first aid','Help those in need without bias'],
    points_gu:['માનવતાવાદી કાર્યને ટેકો આપો','સ્વયંસેવક બનો અને રક્તદાન કરો','પ્રાથમિક સારવાર શીખો','પક્ષપાત વગર જરૂરિયાતમંદોને મદદ કરો'],
    cta_en:'Be humanity in action — help those in need.', cta_gu:'ક્રિયામાં માનવતા બનો — જરૂરિયાતમંદોને મદદ કરો.',
    hashtags:['RedCrossDay','Humanity','Volunteer'], icon:'cross', category:'Health & Humanitarian'
  },
  'world-bee-day': {
    title_en:'World Bee Day', title_gu:'વિશ્વ મધમાખી દિવસ',
    importance_en:'A UN day recognising bees and pollinators as vital for food and nature.',
    importance_gu:'મધમાખી અને પરાગનયનકારોને ખોરાક અને પ્રકૃતિ માટે મહત્વપૂર્ણ ગણતો UN દિવસ.',
    points_en:['Plant flowers that feed pollinators','Avoid harmful pesticides','Protect natural habitats','Support local beekeepers'],
    points_gu:['પરાગનયનકારોને પોષતાં ફૂલ રોપો','હાનિકારક જંતુનાશક ટાળો','કુદરતી આવાસનું રક્ષણ કરો','સ્થાનિક મધમાખી ઉછેરનારાઓને ટેકો આપો'],
    cta_en:'Protect bees — protect our food.', cta_gu:'મધમાખીનું રક્ષણ કરો — આપણા ખોરાકનું રક્ષણ કરો.',
    hashtags:['WorldBeeDay','SaveTheBees','Pollinators'], icon:'leaf', category:'Environment'
  },
  'world-refugee-day': {
    title_en:'World Refugee Day', title_gu:'વિશ્વ શરણાર્થી દિવસ',
    importance_en:'A UN day honouring refugees and their courage, rights and dignity.',
    importance_gu:'શરણાર્થીઓ અને તેમની હિંમત, અધિકારો અને ગૌરવને સન્માન આપતો UN દિવસ.',
    points_en:['Show empathy to displaced people','Support refugees’ access to care','Reject prejudice and fear','Welcome and include newcomers'],
    points_gu:['વિસ્થાપિત લોકો પ્રત્યે સહાનુભૂતિ દર્શાવો','શરણાર્થીઓની સંભાળ ઉપલબ્ધતાને ટેકો આપો','પૂર્વગ્રહ અને ભયને નકારો','નવા આવનારાઓને આવકારો અને સામેલ કરો'],
    cta_en:'Stand with refugees — with dignity and hope.', cta_gu:'શરણાર્થીઓ સાથે ઊભા રહો — ગૌરવ અને આશા સાથે.',
    hashtags:['WorldRefugeeDay','WithRefugees','Humanity'], icon:'help', category:'Humanitarian'
  },
  'international-literacy-day': {
    title_en:'International Literacy Day', title_gu:'આંતરરાષ્ટ્રીય સાક્ષરતા દિવસ',
    importance_en:'A UNESCO day promoting literacy as a right and a foundation for a better life.',
    importance_gu:'સાક્ષરતાને અધિકાર અને સારા જીવનના પાયા તરીકે પ્રોત્સાહન આપતો UNESCO દિવસ.',
    points_en:['Support reading for children and adults','Help someone learn to read','Value libraries and learning','Promote education for all'],
    points_gu:['બાળકો અને પુખ્તો માટે વાંચનને ટેકો આપો','કોઈને વાંચતાં શીખવામાં મદદ કરો','પુસ્તકાલય અને શિક્ષણને મૂલવો','બધા માટે શિક્ષણને પ્રોત્સાહન આપો'],
    cta_en:'Literacy for all — open doors with reading.', cta_gu:'બધા માટે સાક્ષરતા — વાંચનથી દરવાજા ખોલો.',
    hashtags:['LiteracyDay','ReadingForAll','Education'], icon:'book', category:'Education'
  },
  'world-ozone-day': {
    title_en:'World Ozone Day', title_gu:'વિશ્વ ઓઝોન દિવસ',
    importance_en:'A UN day for protecting the ozone layer that shields life from harmful rays.',
    importance_gu:'હાનિકારક કિરણોથી જીવનનું રક્ષણ કરતા ઓઝોન સ્તરના રક્ષણ માટેનો UN દિવસ.',
    points_en:['Avoid ozone-harming products','Maintain cooling appliances properly','Support climate-friendly choices','Spread awareness of ozone protection'],
    points_gu:['ઓઝોનને નુકસાન કરતાં ઉત્પાદનો ટાળો','ઠંડક ઉપકરણો યોગ્ય રીતે જાળવો','આબોહવા-મૈત્રીપૂર્ણ પસંદગીઓને ટેકો આપો','ઓઝોન રક્ષણની જાગૃતિ ફેલાવો'],
    cta_en:'Protect the ozone — protect life on Earth.', cta_gu:'ઓઝોનનું રક્ષણ કરો — પૃથ્વી પરના જીવનનું રક્ષણ કરો.',
    hashtags:['WorldOzoneDay','SaveOzone','ClimateAction'], icon:'sun', category:'Environment'
  }
};
Object.assign(TOPIC_CONTENT, OFFICIAL_CIVIC_CONTENT);

// ---- Content library (BATCH 5: remaining national + international) ----
const OFFICIAL_CIVIC2_CONTENT = {
  'indian-army-day': {
    title_en:'Indian Army Day', title_gu:'ભારતીય સેના દિવસ',
    importance_en:'India honours its Army for its service, courage and sacrifice in defending the nation.',
    importance_gu:'ભારત તેની સેનાની રાષ્ટ્રરક્ષામાં સેવા, હિંમત અને બલિદાન બદલ સન્માન કરે છે.',
    points_en:['Respect and thank our soldiers','Remember those who sacrificed','Support veterans and their families','Serve the nation in your own way'],
    points_gu:['આપણા સૈનિકોનું સન્માન કરો અને આભાર માનો','બલિદાન આપનારાઓને યાદ કરો','પૂર્વ સૈનિકો અને તેમના પરિવારોને ટેકો આપો','તમારી રીતે રાષ્ટ્રની સેવા કરો'],
    cta_en:'Salute our soldiers — proud of the Army.', cta_gu:'આપણા સૈનિકોને સલામ — સેના પર ગર્વ.',
    hashtags:['ArmyDay','JaiHind','SaluteSoldiers'], icon:'flag', category:'National'
  },
  'parakram-diwas': {
    title_en:'Parakram Diwas', title_gu:'પરાક્રમ દિવસ',
    importance_en:'Marks Netaji Subhas Chandra Bose’s birthday and the spirit of courage and patriotism.',
    importance_gu:'નેતાજી સુભાષ ચંદ્ર બોઝના જન્મદિન અને હિંમત તથા દેશભક્તિની ભાવનાની યાદ અપાવે છે.',
    points_en:['Draw inspiration from Netaji','Show courage in daily life','Serve the nation selflessly','Stand up for what is right'],
    points_gu:['નેતાજીમાંથી પ્રેરણા લો','રોજિંદા જીવનમાં હિંમત દર્શાવો','નિઃસ્વાર્થપણે રાષ્ટ્રની સેવા કરો','જે સાચું છે તેના માટે ઊભા રહો'],
    cta_en:'Courage and patriotism — the Netaji spirit.', cta_gu:'હિંમત અને દેશભક્તિ — નેતાજીની ભાવના.',
    hashtags:['ParakramDiwas','Netaji','ProudIndian'], icon:'flag', category:'National'
  },
  'martyrs-day': {
    title_en:"Martyrs' Day / Anti-Leprosy Day", title_gu:'શહીદ દિવસ / રક્તપિત્ત વિરોધી દિવસ',
    importance_en:'India remembers its martyrs and also raises awareness that leprosy is curable.',
    importance_gu:'ભારત તેના શહીદોને યાદ કરે છે અને રક્તપિત્ત સાજો થઈ શકે છે તેની જાગૃતિ પણ લાવે છે.',
    points_en:['Honour those who gave their lives','Promote peace and non-violence','Know that leprosy is curable','End stigma against those affected'],
    points_gu:['જીવ આપનારાઓને સન્માન આપો','શાંતિ અને અહિંસાને પ્રોત્સાહન આપો','જાણો કે રક્તપિત્ત સાજો થાય છે','પ્રભાવિતો સામેનું કલંક દૂર કરો'],
    cta_en:'Remember martyrs — spread peace and awareness.', cta_gu:'શહીદોને યાદ કરો — શાંતિ અને જાગૃતિ ફેલાવો.',
    hashtags:['MartyrsDay','AntiLeprosyDay','Peace'], icon:'peace', category:'National & Health'
  },
  'shaheed-diwas': {
    title_en:'Shaheed Diwas', title_gu:'શહીદ દિવસ',
    importance_en:'India remembers freedom fighters Bhagat Singh, Rajguru and Sukhdev and their sacrifice.',
    importance_gu:'ભારત સ્વાતંત્ર્ય સેનાની ભગત સિંહ, રાજગુરુ અને સુખદેવ અને તેમના બલિદાનને યાદ કરે છે.',
    points_en:['Honour the freedom fighters','Value the freedom you enjoy','Serve society with courage','Keep patriotism alive'],
    points_gu:['સ્વાતંત્ર્ય સેનાનીઓને સન્માન આપો','તમે માણો છો તે સ્વતંત્રતાની કદર કરો','હિંમતથી સમાજની સેવા કરો','દેશભક્તિ જીવંત રાખો'],
    cta_en:'Remember the martyrs of freedom.', cta_gu:'સ્વતંત્રતાના શહીદોને યાદ કરો.',
    hashtags:['ShaheedDiwas','BhagatSingh','Freedom'], icon:'flag', category:'National'
  },
  'national-maritime-day': {
    title_en:'National Maritime Day', title_gu:'રાષ્ટ્રીય દરિયાઈ દિવસ',
    importance_en:'India recognises the role of shipping and seafarers in trade and the economy.',
    importance_gu:'ભારત વેપાર અને અર્થતંત્રમાં જહાજ અને દરિયાખેડુઓની ભૂમિકાને માન્યતા આપે છે.',
    points_en:['Appreciate seafarers’ hard work','Support safe maritime practices','Protect the marine environment','Value ocean-based trade'],
    points_gu:['દરિયાખેડુઓની મહેનતની કદર કરો','સલામત દરિયાઈ પ્રથાઓને ટેકો આપો','દરિયાઈ પર્યાવરણનું રક્ષણ કરો','સમુદ્ર-આધારિત વેપારને મૂલવો'],
    cta_en:'Honour seafarers who keep trade moving.', cta_gu:'વેપાર ચાલુ રાખતા દરિયાખેડુઓને સન્માન આપો.',
    hashtags:['MaritimeDay','Seafarers','Shipping'], icon:'water', category:'National'
  },
  'national-panchayati-raj-day': {
    title_en:'National Panchayati Raj Day', title_gu:'રાષ્ટ્રીય પંચાયતી રાજ દિવસ',
    importance_en:'India celebrates local self-government that brings democracy to the grassroots.',
    importance_gu:'ભારત લોકશાહીને પાયાના સ્તરે લાવતા સ્થાનિક સ્વરાજની ઉજવણી કરે છે.',
    points_en:['Take part in local governance','Attend gram sabha meetings','Hold local leaders accountable','Work for village development'],
    points_gu:['સ્થાનિક શાસનમાં ભાગ લો','ગ્રામ સભાની બેઠકોમાં હાજર રહો','સ્થાનિક નેતાઓને જવાબદાર ઠેરવો','ગામના વિકાસ માટે કામ કરો'],
    cta_en:'Strengthen democracy at the grassroots.', cta_gu:'પાયાના સ્તરે લોકશાહી મજબૂત કરો.',
    hashtags:['PanchayatiRajDay','LocalGovernance','Democracy'], icon:'building', category:'National'
  },
  'labour-day': {
    title_en:'International Labour Day', title_gu:'આંતરરાષ્ટ્રીય મજૂર દિવસ',
    importance_en:'A day honouring workers and the value of fair, safe and dignified work.',
    importance_gu:'કામદારો અને ન્યાયી, સલામત તથા ગૌરવપૂર્ણ કામના મૂલ્યને સન્માન આપતો દિવસ.',
    points_en:['Respect all kinds of work','Support fair wages and safety','Know your rights as a worker','Value the people who serve us'],
    points_gu:['દરેક પ્રકારના કામનું સન્માન કરો','ન્યાયી વેતન અને સલામતીને ટેકો આપો','કામદાર તરીકે તમારા અધિકારો જાણો','આપણી સેવા કરતા લોકોને મૂલવો'],
    cta_en:'Honour workers — dignity for all labour.', cta_gu:'કામદારોને સન્માન આપો — દરેક શ્રમ માટે ગૌરવ.',
    hashtags:['LabourDay','WorkersDay','MayDay'], icon:'helmet', category:'National & Labour'
  },
  'national-technology-day': {
    title_en:'National Technology Day', title_gu:'રાષ્ટ્રીય ટેકનોલોજી દિવસ',
    importance_en:'India celebrates its scientific and technological achievements.',
    importance_gu:'ભારત તેની વૈજ્ઞાનિક અને તકનીકી સિદ્ધિઓની ઉજવણી કરે છે.',
    points_en:['Embrace useful technology','Support research and innovation','Use technology responsibly','Encourage students in STEM'],
    points_gu:['ઉપયોગી ટેકનોલોજી અપનાવો','સંશોધન અને નવીનતાને ટેકો આપો','ટેકનોલોજી જવાબદારીપૂર્વક વાપરો','વિદ્યાર્થીઓને STEMમાં પ્રોત્સાહિત કરો'],
    cta_en:'Celebrate technology that serves people.', cta_gu:'લોકોની સેવા કરતી ટેકનોલોજીની ઉજવણી કરો.',
    hashtags:['NationalTechnologyDay','Innovation','MakeInIndia'], icon:'atom', category:'National & Science'
  },
  'national-handloom-day': {
    title_en:'National Handloom Day', title_gu:'રાષ્ટ્રીય હાથવણાટ દિવસ',
    importance_en:'India honours handloom weavers and the heritage of Indian textiles.',
    importance_gu:'ભારત હાથવણાટ કારીગરો અને ભારતીય કાપડના વારસાને સન્માન આપે છે.',
    points_en:['Buy and value handloom products','Support local weavers','Preserve traditional crafts','Take pride in Indian textiles'],
    points_gu:['હાથવણાટ ઉત્પાદનો ખરીદો અને મૂલવો','સ્થાનિક વણકરોને ટેકો આપો','પરંપરાગત કારીગરીનું જતન કરો','ભારતીય કાપડ પર ગર્વ કરો'],
    cta_en:'Support handloom — wear our heritage.', cta_gu:'હાથવણાટને ટેકો આપો — આપણો વારસો પહેરો.',
    hashtags:['HandloomDay','VocalForLocal','Heritage'], icon:'book', category:'National'
  },
  'quit-india-day': {
    title_en:'Quit India Movement Day', title_gu:'ભારત છોડો આંદોલન દિવસ',
    importance_en:'India remembers the 1942 call for independence and the courage of the freedom movement.',
    importance_gu:'ભારત 1942ના સ્વતંત્રતાના આહ્વાન અને સ્વાતંત્ર્ય આંદોલનની હિંમતને યાદ કરે છે.',
    points_en:['Remember the freedom struggle','Value unity and determination','Serve the nation today','Uphold democratic ideals'],
    points_gu:['સ્વાતંત્ર્ય સંગ્રામને યાદ કરો','એકતા અને દૃઢતાને મૂલવો','આજે રાષ્ટ્રની સેવા કરો','લોકશાહી આદર્શો જાળવો'],
    cta_en:'Remember the spirit of Quit India.', cta_gu:'ભારત છોડોની ભાવનાને યાદ કરો.',
    hashtags:['QuitIndiaDay','AugustKranti','Freedom'], icon:'flag', category:'National'
  },
  'world-biofuel-day': {
    title_en:'World Biofuel Day', title_gu:'વિશ્વ જૈવઇંધણ દિવસ',
    importance_en:'Observed in India to promote cleaner biofuels and reduce dependence on fossil fuels.',
    importance_gu:'સ્વચ્છ જૈવઇંધણને પ્રોત્સાહન આપવા અને અશ્મિભૂત ઇંધણ પરની નિર્ભરતા ઘટાડવા ભારતમાં ઉજવાય છે.',
    points_en:['Support cleaner fuel choices','Reduce fuel waste','Recycle used cooking oil safely','Back renewable energy'],
    points_gu:['સ્વચ્છ ઇંધણ પસંદગીઓને ટેકો આપો','ઇંધણનો બગાડ ઘટાડો','વપરાયેલ રસોઈ તેલ સલામત રીતે રિસાયકલ કરો','નવીનીકરણીય ઊર્જાને ટેકો આપો'],
    cta_en:'Choose cleaner fuels for a greener future.', cta_gu:'હરિયાળા ભવિષ્ય માટે સ્વચ્છ ઇંધણ પસંદ કરો.',
    hashtags:['WorldBiofuelDay','CleanEnergy','Sustainability'], icon:'sun', category:'Environment & Energy'
  },
  'sadbhavana-diwas': {
    title_en:'Sadbhavana Diwas', title_gu:'સદ્ભાવના દિવસ',
    importance_en:'A day promoting national integration, peace and harmony among all communities.',
    importance_gu:'બધા સમુદાયો વચ્ચે રાષ્ટ્રીય એકતા, શાંતિ અને સૌહાર્દને પ્રોત્સાહન આપતો દિવસ.',
    points_en:['Promote harmony and goodwill','Respect all faiths and cultures','Resolve conflicts peacefully','Build bridges in your community'],
    points_gu:['સૌહાર્દ અને સદ્ભાવનાને પ્રોત્સાહન આપો','બધા ધર્મો અને સંસ્કૃતિઓનું સન્માન કરો','સંઘર્ષ શાંતિપૂર્ણ રીતે ઉકેલો','તમારા સમુદાયમાં સેતુ બાંધો'],
    cta_en:'Spread goodwill — live in harmony.', cta_gu:'સદ્ભાવના ફેલાવો — સૌહાર્દથી જીવો.',
    hashtags:['SadbhavanaDiwas','Harmony','Unity'], icon:'peace', category:'National & Social'
  },
  'national-sports-day': {
    title_en:'National Sports Day', title_gu:'રાષ્ટ્રીય રમત દિવસ',
    importance_en:'Marks hockey legend Major Dhyan Chand’s birthday and the value of sport and fitness.',
    importance_gu:'હોકી દિગ્ગજ મેજર ધ્યાનચંદના જન્મદિન અને રમત તથા તંદુરસ્તીના મૂલ્યની યાદ અપાવે છે.',
    points_en:['Play a sport you enjoy','Stay active every day','Encourage children to play','Value fitness and teamwork'],
    points_gu:['તમને ગમતી રમત રમો','દરરોજ સક્રિય રહો','બાળકોને રમવા પ્રોત્સાહિત કરો','તંદુરસ્તી અને ટીમવર્કને મૂલવો'],
    cta_en:'Play, move, stay fit — for life.', cta_gu:'રમો, ચાલો, તંદુરસ્ત રહો — જીવનભર.',
    hashtags:['NationalSportsDay','FitIndia','PlayMore'], icon:'sport', category:'Health & Sports'
  },
  'national-small-industry-day': {
    title_en:'National Small Industry Day', title_gu:'રાષ્ટ્રીય લઘુ ઉદ્યોગ દિવસ',
    importance_en:'India recognises small industries for jobs, innovation and economic growth.',
    importance_gu:'ભારત નોકરી, નવીનતા અને આર્થિક વૃદ્ધિ માટે લઘુ ઉદ્યોગોને માન્યતા આપે છે.',
    points_en:['Support small and local businesses','Value entrepreneurship','Buy local products','Encourage skill and enterprise'],
    points_gu:['નાના અને સ્થાનિક વ્યવસાયોને ટેકો આપો','ઉદ્યોગસાહસિકતાને મૂલવો','સ્થાનિક ઉત્પાદનો ખરીદો','કૌશલ્ય અને સાહસને પ્રોત્સાહન આપો'],
    cta_en:'Back small business — power local growth.', cta_gu:'લઘુ ઉદ્યોગને ટેકો આપો — સ્થાનિક વૃદ્ધિને શક્તિ આપો.',
    hashtags:['SmallIndustryDay','VocalForLocal','MSME'], icon:'money', category:'National & Economy'
  },
  'kargil-vijay-diwas': {
    title_en:'Kargil Vijay Diwas', title_gu:'કારગિલ વિજય દિવસ',
    importance_en:'India honours the soldiers of the 1999 Kargil war and their supreme sacrifice.',
    importance_gu:'ભારત 1999ના કારગિલ યુદ્ધના સૈનિકો અને તેમના સર્વોચ્ચ બલિદાનને સન્માન આપે છે.',
    points_en:['Remember the Kargil heroes','Honour soldiers’ sacrifice','Support armed forces families','Take pride in the nation'],
    points_gu:['કારગિલના વીરોને યાદ કરો','સૈનિકોના બલિદાનને સન્માન આપો','સશસ્ત્ર દળોના પરિવારોને ટેકો આપો','રાષ્ટ્ર પર ગર્વ કરો'],
    cta_en:'Salute the heroes of Kargil.', cta_gu:'કારગિલના વીરોને સલામ.',
    hashtags:['KargilVijayDiwas','JaiHind','SaluteSoldiers'], icon:'flag', category:'National'
  },
  'indian-air-force-day': {
    title_en:'Indian Air Force Day', title_gu:'ભારતીય વાયુસેના દિવસ',
    importance_en:'India honours the Air Force for guarding the skies and serving the nation.',
    importance_gu:'ભારત આકાશની રક્ષા અને રાષ્ટ્રસેવા બદલ વાયુસેનાને સન્માન આપે છે.',
    points_en:['Respect our air warriors','Remember their service','Support veterans','Inspire youth to serve'],
    points_gu:['આપણા વાયુ યોદ્ધાઓનું સન્માન કરો','તેમની સેવાને યાદ કરો','પૂર્વ સૈનિકોને ટેકો આપો','યુવાનોને સેવા માટે પ્રેરિત કરો'],
    cta_en:'Salute the Indian Air Force.', cta_gu:'ભારતીય વાયુસેનાને સલામ.',
    hashtags:['AirForceDay','IndianAirForce','JaiHind'], icon:'flag', category:'National'
  },
  'national-education-day': {
    title_en:'National Education Day', title_gu:'રાષ્ટ્રીય શિક્ષણ દિવસ',
    importance_en:'India celebrates education and the vision of Maulana Abul Kalam Azad.',
    importance_gu:'ભારત શિક્ષણ અને મૌલાના અબુલ કલામ આઝાદની દૂરંદેશીની ઉજવણી કરે છે.',
    points_en:['Value education for all','Support children’s schooling','Keep learning throughout life','Reduce barriers to education'],
    points_gu:['બધા માટે શિક્ષણને મૂલવો','બાળકોના શાળા શિક્ષણને ટેકો આપો','જીવનભર શીખતા રહો','શિક્ષણના અવરોધો ઘટાડો'],
    cta_en:'Education for all — the key to progress.', cta_gu:'બધા માટે શિક્ષણ — પ્રગતિની ચાવી.',
    hashtags:['NationalEducationDay','EducationForAll','Learning'], icon:'cap', category:'National & Education'
  },
  'national-press-day': {
    title_en:'National Press Day', title_gu:'રાષ્ટ્રીય પ્રેસ દિવસ',
    importance_en:'India marks the value of a free and responsible press in a democracy.',
    importance_gu:'ભારત લોકશાહીમાં સ્વતંત્ર અને જવાબદાર પ્રેસના મૂલ્યની યાદ કરે છે.',
    points_en:['Value a free, responsible press','Verify news before sharing','Support ethical journalism','Reject misinformation'],
    points_gu:['સ્વતંત્ર, જવાબદાર પ્રેસને મૂલવો','શેર કરતાં પહેલાં સમાચાર ચકાસો','નૈતિક પત્રકારત્વને ટેકો આપો','ખોટી માહિતીને નકારો'],
    cta_en:'Value a free and fair press.', cta_gu:'સ્વતંત્ર અને ન્યાયી પ્રેસને મૂલવો.',
    hashtags:['NationalPressDay','FreePress','Journalism'], icon:'news', category:'National & Media'
  },
  'national-pollution-control-day': {
    title_en:'National Pollution Control Day', title_gu:'રાષ્ટ્રીય પ્રદૂષણ નિયંત્રણ દિવસ',
    importance_en:'India raises awareness of pollution’s harm and the need to protect air, water and land.',
    importance_gu:'ભારત પ્રદૂષણના નુકસાન અને હવા, પાણી તથા જમીનના રક્ષણની જરૂરિયાત વિશે જાગૃતિ લાવે છે.',
    points_en:['Reduce, reuse and recycle','Avoid burning waste','Use cleaner transport','Support pollution control efforts'],
    points_gu:['ઘટાડો, પુનઃવાપરો અને રિસાયકલ કરો','કચરો બાળવાનું ટાળો','સ્વચ્છ પરિવહન વાપરો','પ્રદૂષણ નિયંત્રણ પ્રયાસોને ટેકો આપો'],
    cta_en:'Control pollution — protect air, water and land.', cta_gu:'પ્રદૂષણ નિયંત્રિત કરો — હવા, પાણી અને જમીનનું રક્ષણ કરો.',
    hashtags:['PollutionControlDay','BeatPollution','CleanAir'], icon:'leaf', category:'Health & Environment'
  },
  'indian-navy-day': {
    title_en:'Indian Navy Day', title_gu:'ભારતીય નૌકાદળ દિવસ',
    importance_en:'India honours the Navy for protecting its seas and maritime interests.',
    importance_gu:'ભારત તેના સમુદ્રો અને દરિયાઈ હિતોના રક્ષણ બદલ નૌકાદળને સન્માન આપે છે.',
    points_en:['Respect our naval forces','Remember their service and valour','Support veterans and families','Take pride in the nation'],
    points_gu:['આપણા નૌકાદળનું સન્માન કરો','તેમની સેવા અને શૌર્યને યાદ કરો','પૂર્વ સૈનિકો અને પરિવારોને ટેકો આપો','રાષ્ટ્ર પર ગર્વ કરો'],
    cta_en:'Salute the Indian Navy.', cta_gu:'ભારતીય નૌકાદળને સલામ.',
    hashtags:['NavyDay','IndianNavy','JaiHind'], icon:'water', category:'National'
  },
  'armed-forces-flag-day': {
    title_en:'Armed Forces Flag Day', title_gu:'સશસ્ત્ર દળ ધ્વજ દિવસ',
    importance_en:'A day to honour soldiers and support the welfare of veterans and their families.',
    importance_gu:'સૈનિકોને સન્માન આપવા અને પૂર્વ સૈનિકો તથા તેમના પરિવારોના કલ્યાણને ટેકો આપવાનો દિવસ.',
    points_en:['Honour serving and retired soldiers','Contribute to the welfare fund','Support veterans and their families','Express gratitude for their service'],
    points_gu:['સેવારત અને નિવૃત્ત સૈનિકોને સન્માન આપો','કલ્યાણ નિધિમાં યોગદાન આપો','પૂર્વ સૈનિકો અને પરિવારોને ટેકો આપો','તેમની સેવા બદલ કૃતજ્ઞતા વ્યક્ત કરો'],
    cta_en:'Honour our forces — support their welfare.', cta_gu:'આપણા દળોને સન્માન આપો — તેમના કલ્યાણને ટેકો આપો.',
    hashtags:['FlagDay','SupportSoldiers','JaiHind'], icon:'flag', category:'National'
  },
  'good-governance-day': {
    title_en:'Good Governance Day', title_gu:'સુશાસન દિવસ',
    importance_en:'India promotes accountable, transparent and citizen-friendly governance.',
    importance_gu:'ભારત જવાબદાર, પારદર્શક અને નાગરિક-મૈત્રીપૂર્ણ શાસનને પ્રોત્સાહન આપે છે.',
    points_en:['Demand transparency and accountability','Use citizen services and rights','Participate in governance','Report corruption'],
    points_gu:['પારદર્શિતા અને જવાબદારીની માંગ કરો','નાગરિક સેવાઓ અને અધિકારો વાપરો','શાસનમાં ભાગ લો','ભ્રષ્ટાચારની જાણ કરો'],
    cta_en:'Support good governance — stay engaged.', cta_gu:'સુશાસનને ટેકો આપો — સંલગ્ન રહો.',
    hashtags:['GoodGovernanceDay','Transparency','Governance'], icon:'building', category:'National & Governance'
  },
  'world-hindi-day': {
    title_en:'World Hindi Day', title_gu:'વિશ્વ હિન્દી દિવસ',
    importance_en:'A day promoting the Hindi language on the global stage.',
    importance_gu:'વૈશ્વિક મંચ પર હિન્દી ભાષાને પ્રોત્સાહન આપતો દિવસ.',
    points_en:['Take pride in your language','Read and share in Hindi','Respect all languages','Connect cultures through language'],
    points_gu:['તમારી ભાષા પર ગર્વ કરો','હિન્દીમાં વાંચો અને શેર કરો','બધી ભાષાઓનું સન્માન કરો','ભાષા દ્વારા સંસ્કૃતિઓને જોડો'],
    cta_en:'Celebrate Hindi around the world.', cta_gu:'વિશ્વભરમાં હિન્દીની ઉજવણી કરો.',
    hashtags:['WorldHindiDay','Language','Culture'], icon:'language', category:'Language & Culture'
  },
  'zero-tolerance-fgm': {
    title_en:'International Day of Zero Tolerance for FGM', title_gu:'FGM સામે શૂન્ય સહનશીલતાનો આંતરરાષ્ટ્રીય દિવસ',
    importance_en:'A UN day to end female genital mutilation and protect the health and rights of girls.',
    importance_gu:'સ્ત્રી જનનાંગ વિચ્છેદન નાબૂદ કરવા અને બાળિકાઓના આરોગ્ય તથા અધિકારોના રક્ષણ માટેનો UN દિવસ.',
    points_en:['Protect girls from harmful practices','Support survivors’ health and rights','Raise awareness in communities','Uphold every girl’s dignity'],
    points_gu:['બાળિકાઓને હાનિકારક પ્રથાઓથી બચાવો','પીડિતોના આરોગ્ય અને અધિકારોને ટેકો આપો','સમુદાયોમાં જાગૃતિ લાવો','દરેક બાળિકાનું ગૌરવ જાળવો'],
    cta_en:'End FGM — protect girls’ health and rights.', cta_gu:'FGM નાબૂદ કરો — બાળિકાઓના આરોગ્ય અને અધિકારોનું રક્ષણ કરો.',
    hashtags:['EndFGM','GirlsRights','ZeroTolerance'], icon:'woman', category:'Health & Rights'
  },
  'women-girls-in-science': {
    title_en:'International Day of Women and Girls in Science', title_gu:'વિજ્ઞાનમાં મહિલા અને બાળિકા આંતરરાષ્ટ્રીય દિવસ',
    importance_en:'A UN day to promote equal access for women and girls in science.',
    importance_gu:'વિજ્ઞાનમાં મહિલા અને બાળિકાઓ માટે સમાન તકને પ્રોત્સાહન આપતો UN દિવસ.',
    points_en:['Encourage girls in science','Break gender stereotypes','Support women scientists','Provide equal opportunities'],
    points_gu:['બાળિકાઓને વિજ્ઞાનમાં પ્રોત્સાહિત કરો','લિંગ રૂઢિઓ તોડો','મહિલા વૈજ્ઞાનિકોને ટેકો આપો','સમાન તકો પૂરી પાડો'],
    cta_en:'Empower women and girls in science.', cta_gu:'વિજ્ઞાનમાં મહિલા અને બાળિકાઓને સશક્ત બનાવો.',
    hashtags:['WomenInScience','GirlsInSTEM','Equality'], icon:'microscope', category:'Science & Inclusion'
  },
  'world-radio-day': {
    title_en:'World Radio Day', title_gu:'વિશ્વ રેડિયો દિવસ',
    importance_en:'A UNESCO day celebrating radio’s power to inform, educate and connect people.',
    importance_gu:'લોકોને માહિતગાર કરવા, શિક્ષિત કરવા અને જોડવાની રેડિયોની શક્તિની ઉજવણી કરતો UNESCO દિવસ.',
    points_en:['Value radio as a public service','Use radio for reliable information','Support community broadcasting','Appreciate accessible media'],
    points_gu:['રેડિયોને જાહેર સેવા તરીકે મૂલવો','વિશ્વસનીય માહિતી માટે રેડિયો વાપરો','સામુદાયિક પ્રસારણને ટેકો આપો','સુલભ મીડિયાની કદર કરો'],
    cta_en:'Celebrate radio — informing and connecting all.', cta_gu:'રેડિયોની ઉજવણી કરો — બધાને માહિતગાર અને જોડતું.',
    hashtags:['WorldRadioDay','Radio','Media'], icon:'news', category:'Communication'
  },
  'world-day-social-justice': {
    title_en:'World Day of Social Justice', title_gu:'વિશ્વ સામાજિક ન્યાય દિવસ',
    importance_en:'A UN day for fairness, equality and opportunity for all in society.',
    importance_gu:'સમાજમાં બધા માટે ન્યાયીપણું, સમાનતા અને તક માટેનો UN દિવસ.',
    points_en:['Support fair opportunity for all','Stand against discrimination','Promote decent work','Help reduce inequality'],
    points_gu:['બધા માટે ન્યાયી તકને ટેકો આપો','ભેદભાવ સામે ઊભા રહો','યોગ્ય કામને પ્રોત્સાહન આપો','અસમાનતા ઘટાડવામાં મદદ કરો'],
    cta_en:'Build a fair society — social justice for all.', cta_gu:'ન્યાયી સમાજ બનાવો — બધા માટે સામાજિક ન્યાય.',
    hashtags:['SocialJusticeDay','Equality','Fairness'], icon:'scales', category:'Social'
  },
  'world-ngo-day': {
    title_en:'World NGO Day', title_gu:'વિશ્વ NGO દિવસ',
    importance_en:'A day recognising non-governmental organisations and volunteers who serve communities.',
    importance_gu:'સમુદાયોની સેવા કરતી બિનસરકારી સંસ્થાઓ અને સ્વયંસેવકોને માન્યતા આપતો દિવસ.',
    points_en:['Support causes you believe in','Volunteer your time or skills','Recognise community workers','Give responsibly to trusted groups'],
    points_gu:['તમે માનો છો તે હેતુઓને ટેકો આપો','તમારો સમય કે કૌશલ્ય સ્વયંસેવક તરીકે આપો','સામુદાયિક કાર્યકરોને માન્યતા આપો','વિશ્વસનીય જૂથોને જવાબદારીપૂર્વક દાન કરો'],
    cta_en:'Support those who serve — celebrate NGOs.', cta_gu:'સેવા કરનારાઓને ટેકો આપો — NGOની ઉજવણી કરો.',
    hashtags:['WorldNGODay','Volunteer','Community'], icon:'handshake', category:'Social'
  },
  'world-heritage-day': {
    title_en:'World Heritage Day', title_gu:'વિશ્વ વારસો દિવસ',
    importance_en:'A day to celebrate and protect cultural heritage and historic monuments.',
    importance_gu:'સાંસ્કૃતિક વારસો અને ઐતિહાસિક સ્મારકોની ઉજવણી અને રક્ષણ માટેનો દિવસ.',
    points_en:['Respect and protect monuments','Learn local history','Support heritage conservation','Travel responsibly to heritage sites'],
    points_gu:['સ્મારકોનું સન્માન કરો અને રક્ષણ કરો','સ્થાનિક ઇતિહાસ જાણો','વારસો સંરક્ષણને ટેકો આપો','વારસો સ્થળોએ જવાબદારીપૂર્વક મુસાફરી કરો'],
    cta_en:'Protect our heritage for the future.', cta_gu:'ભવિષ્ય માટે આપણા વારસાનું રક્ષણ કરો.',
    hashtags:['WorldHeritageDay','Heritage','Conservation'], icon:'book', category:'Culture'
  },
  'safety-health-at-work': {
    title_en:'World Day for Safety and Health at Work', title_gu:'કાર્યસ્થળ સલામતી અને આરોગ્ય વિશ્વ દિવસ',
    importance_en:'An ILO day promoting safe, healthy workplaces and preventing work injuries.',
    importance_gu:'સલામત, સ્વસ્થ કાર્યસ્થળોને પ્રોત્સાહન આપતો અને કામની ઈજાઓ અટકાવતો ILO દિવસ.',
    points_en:['Follow workplace safety rules','Use protective equipment','Report hazards promptly','Support workers’ health and rest'],
    points_gu:['કાર્યસ્થળ સલામતી નિયમોનું પાલન કરો','રક્ષણાત્મક સાધનો વાપરો','જોખમોની તરત જાણ કરો','કામદારોના આરોગ્ય અને આરામને ટેકો આપો'],
    cta_en:'Make every workplace safe and healthy.', cta_gu:'દરેક કાર્યસ્થળ સલામત અને સ્વસ્થ બનાવો.',
    hashtags:['SafeDay','WorkplaceSafety','OSH'], icon:'helmet', category:'Occupational Health'
  },
  'international-day-families': {
    title_en:'International Day of Families', title_gu:'આંતરરાષ્ટ્રીય પરિવાર દિવસ',
    importance_en:'A UN day celebrating families and their role in wellbeing and society.',
    importance_gu:'પરિવારો અને સુખાકારી તથા સમાજમાં તેમની ભૂમિકાની ઉજવણી કરતો UN દિવસ.',
    points_en:['Spend quality time together','Support each other’s health','Communicate with care','Share responsibilities fairly'],
    points_gu:['સાથે ગુણવત્તાયુક્ત સમય વિતાવો','એકબીજાના આરોગ્યને ટેકો આપો','કાળજીથી વાતચીત કરો','જવાબદારીઓ ન્યાયપૂર્વક વહેંચો'],
    cta_en:'Strong families, healthy communities.', cta_gu:'મજબૂત પરિવારો, સ્વસ્થ સમુદાયો.',
    hashtags:['DayOfFamilies','FamilyMatters','Wellbeing'], icon:'family', category:'Social'
  },
  'world-aids-vaccine-day': {
    title_en:'World AIDS Vaccine Day', title_gu:'વિશ્વ એઇડ્સ રસી દિવસ',
    importance_en:'Also called HIV Vaccine Awareness Day, it thanks researchers and volunteers working towards an HIV vaccine.',
    importance_gu:'એચઆઈવી રસી માટે કામ કરતા સંશોધકો અને સ્વયંસેવકોનો આભાર માનતો દિવસ, જેને એચઆઈવી રસી જાગૃતિ દિવસ પણ કહે છે.',
    points_en:['Support HIV prevention research','Get tested and know your status','Reject HIV-related stigma','Practise safe prevention methods'],
    points_gu:['એચઆઈવી નિવારણ સંશોધનને ટેકો આપો','તપાસ કરાવો અને તમારી સ્થિતિ જાણો','એચઆઈવી સંબંધિત કલંકને નકારો','સલામત નિવારણ પદ્ધતિઓ અપનાવો'],
    cta_en:'Support the search for an HIV vaccine.', cta_gu:'એચઆઈવી રસીની શોધને ટેકો આપો.',
    hashtags:['HIVVaccineAwareness','EndHIV','Research'], icon:'syringe', category:'Health'
  }
};
Object.assign(TOPIC_CONTENT, OFFICIAL_CIVIC2_CONTENT);

// ---- Content library (BATCH 6: remaining + combined-title observances) ----
const OFFICIAL_REST_CONTENT = {
  'world-hearing-wildlife-day': {
    title_en:'World Hearing Day / World Wildlife Day', title_gu:'વિશ્વ શ્રવણ દિવસ / વિશ્વ વન્યજીવ દિવસ',
    importance_en:'Two observances on one day: protecting our hearing and protecting wildlife and nature.',
    importance_gu:'એક જ દિવસે બે ઉજવણી: આપણા શ્રવણનું રક્ષણ અને વન્યજીવન તથા પ્રકૃતિનું રક્ષણ.',
    points_en:['Protect ears from loud noise','Get hearing checked when needed','Protect wildlife and habitats','Never buy or harm endangered species'],
    points_gu:['મોટા અવાજથી કાનનું રક્ષણ કરો','જરૂર પડે ત્યારે શ્રવણ તપાસાવો','વન્યજીવન અને આવાસનું રક્ષણ કરો','લુપ્તપ્રાય પ્રજાતિ ક્યારેય ન ખરીદો કે નુકસાન ન કરો'],
    cta_en:'Protect your hearing and protect wildlife.', cta_gu:'તમારા શ્રવણ અને વન્યજીવનનું રક્ષણ કરો.',
    hashtags:['WorldHearingDay','WorldWildlifeDay','ProtectNature'], icon:'leaf', category:'Health & Environment'
  },
  'cisf-raising-day': {
    title_en:'CISF Raising Day', title_gu:'CISF સ્થાપના દિવસ',
    importance_en:'India honours the Central Industrial Security Force for protecting key installations.',
    importance_gu:'ભારત મુખ્ય સ્થાપનોના રક્ષણ બદલ કેન્દ્રીય ઔદ્યોગિક સુરક્ષા દળને સન્માન આપે છે.',
    points_en:['Respect our security forces','Cooperate with safety checks','Stay alert in public places','Support those who protect us'],
    points_gu:['આપણા સુરક્ષા દળોનું સન્માન કરો','સલામતી તપાસમાં સહકાર આપો','જાહેર સ્થળોએ સતર્ક રહો','આપણું રક્ષણ કરનારાઓને ટેકો આપો'],
    cta_en:'Salute the CISF — guardians of security.', cta_gu:'CISFને સલામ — સુરક્ષાના રક્ષક.',
    hashtags:['CISFRaisingDay','Security','JaiHind'], icon:'shield', category:'National'
  },
  'world-down-syndrome-forests-day': {
    title_en:'World Down Syndrome Day / International Day of Forests', title_gu:'વિશ્વ ડાઉન સિન્ડ્રોમ દિવસ / આંતરરાષ્ટ્રીય જંગલ દિવસ',
    importance_en:'Two observances: inclusion for people with Down syndrome and the value of forests.',
    importance_gu:'બે ઉજવણી: ડાઉન સિન્ડ્રોમ ધરાવતા લોકોનો સમાવેશ અને જંગલોનું મૂલ્ય.',
    points_en:['Include people with Down syndrome','Respect diverse abilities','Protect and plant forests','Value trees for clean air'],
    points_gu:['ડાઉન સિન્ડ્રોમ ધરાવતા લોકોને સામેલ કરો','વિવિધ ક્ષમતાઓનું સન્માન કરો','જંગલોનું રક્ષણ કરો અને રોપો','સ્વચ્છ હવા માટે વૃક્ષોને મૂલવો'],
    cta_en:'Include everyone and protect our forests.', cta_gu:'દરેકને સામેલ કરો અને આપણા જંગલોનું રક્ષણ કરો.',
    hashtags:['WorldDownSyndromeDay','IntlForestDay','Inclusion'], icon:'tree', category:'Health & Environment'
  },
  'safe-motherhood-parkinsons-day': {
    title_en:"National Safe Motherhood Day / World Parkinson's Day", title_gu:'રાષ્ટ્રીય સુરક્ષિત માતૃત્વ દિવસ / વિશ્વ પાર્કિન્સન દિવસ',
    importance_en:'Two observances: safe pregnancy and childbirth, and awareness of Parkinson’s disease.',
    importance_gu:'બે ઉજવણી: સુરક્ષિત ગર્ભાવસ્થા અને પ્રસૂતિ, અને પાર્કિન્સન રોગ વિશે જાગૃતિ.',
    points_en:['Ensure safe antenatal and delivery care','Watch for pregnancy danger signs','Notice early tremor or stiffness','Support people living with Parkinson’s'],
    points_gu:['સુરક્ષિત પ્રસૂતિ-પૂર્વ અને પ્રસૂતિ સંભાળ સુનિશ્ચિત કરો','ગર્ભાવસ્થાના ભયના ચિહ્નો પર ધ્યાન રાખો','વહેલા ધ્રુજારી કે અકડાઈને ઓળખો','પાર્કિન્સન સાથે જીવતા લોકોને ટેકો આપો'],
    cta_en:'Safe motherhood and support for Parkinson’s.', cta_gu:'સુરક્ષિત માતૃત્વ અને પાર્કિન્સન માટે સહારો.',
    hashtags:['SafeMotherhoodDay','WorldParkinsonsDay','Health'], icon:'mom', category:'Health'
  },
  'international-tea-day': {
    title_en:'International Tea Day', title_gu:'આંતરરાષ્ટ્રીય ચા દિવસ',
    importance_en:'A UN day recognising tea’s cultural value and the livelihoods it supports.',
    importance_gu:'ચાના સાંસ્કૃતિક મૂલ્ય અને તે ટકાવતી આજીવિકાને માન્યતા આપતો UN દિવસ.',
    points_en:['Support fair conditions for tea workers','Choose sustainable produce','Enjoy tea in moderation','Value farming livelihoods'],
    points_gu:['ચા કામદારો માટે ન્યાયી પરિસ્થિતિને ટેકો આપો','ટકાઉ ઉપજ પસંદ કરો','ચા મર્યાદામાં માણો','ખેતી આજીવિકાને મૂલવો'],
    cta_en:'Sip responsibly — support tea communities.', cta_gu:'જવાબદારીપૂર્વક પીઓ — ચા સમુદાયોને ટેકો આપો.',
    hashtags:['InternationalTeaDay','Tea','FairTrade'], icon:'leaf', category:'Agriculture'
  },
  'biological-diversity-day': {
    title_en:'International Day for Biological Diversity', title_gu:'આંતરરાષ્ટ્રીય જૈવવિવિધતા દિવસ',
    importance_en:'A UN day to protect the variety of life that keeps ecosystems and people healthy.',
    importance_gu:'ઇકોસિસ્ટમ અને લોકોને સ્વસ્થ રાખતી જીવનની વિવિધતાના રક્ષણ માટેનો UN દિવસ.',
    points_en:['Protect plants, animals and habitats','Avoid harming natural areas','Support native species','Reduce pollution and waste'],
    points_gu:['વનસ્પતિ, પ્રાણી અને આવાસનું રક્ષણ કરો','કુદરતી વિસ્તારોને નુકસાન કરવાનું ટાળો','સ્થાનિક પ્રજાતિઓને ટેકો આપો','પ્રદૂષણ અને કચરો ઘટાડો'],
    cta_en:'Protect biodiversity — life depends on it.', cta_gu:'જૈવવિવિધતાનું રક્ષણ કરો — જીવન તેના પર નિર્ભર છે.',
    hashtags:['BiodiversityDay','ForNature','Biodiversity'], icon:'leaf', category:'Environment'
  },
  'global-day-of-parents': {
    title_en:'Global Day of Parents', title_gu:'વૈશ્વિક માતાપિતા દિવસ',
    importance_en:'A UN day honouring parents for their commitment to their children.',
    importance_gu:'બાળકો પ્રત્યેની પ્રતિબદ્ધતા બદલ માતાપિતાને સન્માન આપતો UN દિવસ.',
    points_en:['Appreciate your parents','Support parents’ wellbeing','Spend time with family','Care across generations'],
    points_gu:['તમારા માતાપિતાની કદર કરો','માતાપિતાની સુખાકારીને ટેકો આપો','પરિવાર સાથે સમય વિતાવો','પેઢીઓ વચ્ચે સંભાળ રાખો'],
    cta_en:'Honour parents — the heart of the family.', cta_gu:'માતાપિતાને સન્માન આપો — પરિવારનું હૃદય.',
    hashtags:['GlobalDayOfParents','FamilyCare','ThankYou'], icon:'family', category:'Social'
  },
  'world-bicycle-day': {
    title_en:'World Bicycle Day', title_gu:'વિશ્વ સાયકલ દિવસ',
    importance_en:'A UN day promoting cycling as healthy, clean and affordable transport.',
    importance_gu:'સાયકલિંગને સ્વસ્થ, સ્વચ્છ અને પરવડે તેવા પરિવહન તરીકે પ્રોત્સાહન આપતો UN દિવસ.',
    points_en:['Cycle for short trips','Wear a helmet and ride safely','Enjoy exercise while commuting','Support cycle-friendly roads'],
    points_gu:['ટૂંકી મુસાફરી માટે સાયકલ ચલાવો','હેલ્મેટ પહેરો અને સલામત ચલાવો','અવરજવર દરમિયાન કસરતનો આનંદ લો','સાયકલ-મૈત્રીપૂર્ણ રસ્તાઓને ટેકો આપો'],
    cta_en:'Ride a bicycle — good for you and the planet.', cta_gu:'સાયકલ ચલાવો — તમારા અને ધરતી માટે સારું.',
    hashtags:['WorldBicycleDay','Cycling','StayActive'], icon:'walk', category:'Physical Activity'
  },
  'world-day-against-child-labour': {
    title_en:'World Day Against Child Labour', title_gu:'બાળ મજૂરી વિરોધી વિશ્વ દિવસ',
    importance_en:'An ILO day to end child labour and protect children’s right to learn and grow.',
    importance_gu:'બાળ મજૂરી નાબૂદ કરવા અને બાળકોના શીખવા-વધવાના અધિકારના રક્ષણ માટેનો ILO દિવસ.',
    points_en:['Keep children in school','Say no to child labour','Report exploitation of children','Support families in need'],
    points_gu:['બાળકોને શાળામાં રાખો','બાળ મજૂરીને ના કહો','બાળકોના શોષણની જાણ કરો','જરૂરિયાતમંદ પરિવારોને ટેકો આપો'],
    cta_en:'End child labour — let children learn.', cta_gu:'બાળ મજૂરી નાબૂદ કરો — બાળકોને શીખવા દો.',
    hashtags:['EndChildLabour','ChildRights','Education'], icon:'child', category:'Social'
  },
  'drug-abuse-day': {
    title_en:'International Day Against Drug Abuse', title_gu:'નશા વિરોધી આંતરરાષ્ટ્રીય દિવસ',
    importance_en:'A UN day to prevent drug abuse and support treatment and recovery.',
    importance_gu:'નશાનો દુરુપયોગ અટકાવવા અને સારવાર તથા સાજા થવાને ટેકો આપવા માટેનો UN દિવસ.',
    points_en:['Say no to drugs','Seek help for addiction early','Support recovery without stigma','Guide youth to healthy choices'],
    points_gu:['નશાને ના કહો','વ્યસન માટે વહેલી મદદ લો','કલંક વગર સાજા થવાને ટેકો આપો','યુવાનોને સ્વસ્થ પસંદગી તરફ દોરો'],
    cta_en:'Say no to drugs — support recovery.', cta_gu:'નશાને ના કહો — સાજા થવાને ટેકો આપો.',
    hashtags:['AgainstDrugAbuse','SayNoToDrugs','Recovery'], icon:'shield', category:'Health & Social'
  },
  'world-youth-skills-day': {
    title_en:'World Youth Skills Day', title_gu:'વિશ્વ યુવા કૌશલ્ય દિવસ',
    importance_en:'A UN day highlighting the skills young people need for work and life.',
    importance_gu:'યુવાનોને કામ અને જીવન માટે જરૂરી કૌશલ્યો દર્શાવતો UN દિવસ.',
    points_en:['Keep learning new skills','Seek training and mentorship','Value practical, vocational skills','Adapt to a changing world'],
    points_gu:['નવા કૌશલ્યો શીખતા રહો','તાલીમ અને માર્ગદર્શન લો','વ્યવહારુ, વ્યાવસાયિક કૌશલ્યોને મૂલવો','બદલાતી દુનિયા સાથે અનુકૂલન કરો'],
    cta_en:'Build skills — build your future.', cta_gu:'કૌશલ્ય બનાવો — તમારું ભવિષ્ય બનાવો.',
    hashtags:['WorldYouthSkillsDay','SkillIndia','Learning'], icon:'graduation', category:'Education & Skills'
  },
  'mandela-day': {
    title_en:'Nelson Mandela International Day', title_gu:'નેલ્સન મંડેલા આંતરરાષ્ટ્રીય દિવસ',
    importance_en:'A UN day inspiring people to serve their communities in Mandela’s spirit.',
    importance_gu:'લોકોને મંડેલાની ભાવનામાં તેમના સમુદાયોની સેવા કરવા પ્રેરિત કરતો UN દિવસ.',
    points_en:['Give time to help others','Stand for justice and equality','Promote peace and forgiveness','Make a difference in your community'],
    points_gu:['અન્યને મદદ કરવા સમય આપો','ન્યાય અને સમાનતા માટે ઊભા રહો','શાંતિ અને ક્ષમાને પ્રોત્સાહન આપો','તમારા સમુદાયમાં ફરક લાવો'],
    cta_en:'Take action — serve your community.', cta_gu:'પગલાં લો — તમારા સમુદાયની સેવા કરો.',
    hashtags:['MandelaDay','TakeAction','Service'], icon:'peace', category:'Social'
  },
  'international-tiger-day': {
    title_en:'International Tiger Day', title_gu:'આંતરરાષ્ટ્રીય વાઘ દિવસ',
    importance_en:'A day to protect tigers and the forests they need to survive.',
    importance_gu:'વાઘ અને તેમને ટકવા માટે જરૂરી જંગલોના રક્ષણ માટેનો દિવસ.',
    points_en:['Support tiger conservation','Protect forests and habitats','Say no to wildlife trade','Respect protected areas'],
    points_gu:['વાઘ સંરક્ષણને ટેકો આપો','જંગલો અને આવાસનું રક્ષણ કરો','વન્યજીવ વેપારને ના કહો','સંરક્ષિત વિસ્તારોનું સન્માન કરો'],
    cta_en:'Save the tiger — protect our forests.', cta_gu:'વાઘને બચાવો — આપણા જંગલોનું રક્ષણ કરો.',
    hashtags:['InternationalTigerDay','SaveTheTiger','Conservation'], icon:'leaf', category:'Environment'
  },
  'trafficking-persons-day': {
    title_en:'World Day Against Trafficking in Persons', title_gu:'વ્યક્તિ તસ્કરી વિરોધી વિશ્વ દિવસ',
    importance_en:'A UN day to end human trafficking and support survivors.',
    importance_gu:'માનવ તસ્કરી નાબૂદ કરવા અને પીડિતોને ટેકો આપવા માટેનો UN દિવસ.',
    points_en:['Learn the signs of trafficking','Report suspected trafficking','Support survivors with dignity','Protect vulnerable people'],
    points_gu:['તસ્કરીના ચિહ્નો જાણો','શંકાસ્પદ તસ્કરીની જાણ કરો','પીડિતોને ગૌરવ સાથે ટેકો આપો','સંવેદનશીલ લોકોનું રક્ષણ કરો'],
    cta_en:'End trafficking — protect the vulnerable.', cta_gu:'તસ્કરી નાબૂદ કરો — સંવેદનશીલોનું રક્ષણ કરો.',
    hashtags:['EndHumanTrafficking','BlueHeart','HumanRights'], icon:'help', category:'Social'
  },
  'hiroshima-day': {
    title_en:'Hiroshima Day', title_gu:'હિરોશિમા દિવસ',
    importance_en:'A day of remembrance and a call for peace and a world free of nuclear weapons.',
    importance_gu:'સ્મરણનો દિવસ અને શાંતિ તથા પરમાણુ શસ્ત્રમુક્ત વિશ્વ માટેની હાકલ.',
    points_en:['Remember the cost of war','Promote peace and disarmament','Resolve conflicts without violence','Value human life'],
    points_gu:['યુદ્ધની કિંમતને યાદ કરો','શાંતિ અને નિઃશસ્ત્રીકરણને પ્રોત્સાહન આપો','હિંસા વગર સંઘર્ષ ઉકેલો','માનવ જીવનને મૂલવો'],
    cta_en:'Remember Hiroshima — choose peace.', cta_gu:'હિરોશિમાને યાદ કરો — શાંતિ પસંદ કરો.',
    hashtags:['HiroshimaDay','Peace','NoNukes'], icon:'peace', category:'Peace'
  },
  'international-youth-day': {
    title_en:'International Youth Day', title_gu:'આંતરરાષ્ટ્રીય યુવા દિવસ',
    importance_en:'A UN day recognising young people’s role in building a better world.',
    importance_gu:'સારી દુનિયા બનાવવામાં યુવાનોની ભૂમિકાને માન્યતા આપતો UN દિવસ.',
    points_en:['Give youth a voice','Support education and jobs','Encourage youth leadership','Invest in young people’s health'],
    points_gu:['યુવાનોને અવાજ આપો','શિક્ષણ અને નોકરીને ટેકો આપો','યુવા નેતૃત્વને પ્રોત્સાહન આપો','યુવાનોના આરોગ્યમાં રોકાણ કરો'],
    cta_en:'Empower youth — shape a better future.', cta_gu:'યુવાનોને સશક્ત બનાવો — સારું ભવિષ્ય ઘડો.',
    hashtags:['InternationalYouthDay','YouthPower','Future'], icon:'teen', category:'Social'
  },
  'world-humanitarian-day': {
    title_en:'World Humanitarian Day', title_gu:'વિશ્વ માનવતાવાદી દિવસ',
    importance_en:'A UN day honouring aid workers who help people in crisis, often at great risk.',
    importance_gu:'સંકટમાં લોકોને મદદ કરતા, ઘણી વાર મોટા જોખમે, સહાય કાર્યકરોને સન્માન આપતો UN દિવસ.',
    points_en:['Respect humanitarian workers','Support relief and aid efforts','Help neighbours in crisis','Show compassion to all'],
    points_gu:['માનવતાવાદી કાર્યકરોનું સન્માન કરો','રાહત અને સહાય પ્રયાસોને ટેકો આપો','સંકટમાં પડોશીઓને મદદ કરો','બધા પ્રત્યે કરુણા દર્શાવો'],
    cta_en:'Honour humanitarians — be kind in crisis.', cta_gu:'માનવતાવાદીઓને સન્માન આપો — સંકટમાં દયાળુ બનો.',
    hashtags:['WorldHumanitarianDay','Humanity','AidWorkers'], icon:'help', category:'Humanitarian'
  },
  'slave-trade-remembrance-day': {
    title_en:'International Day for the Remembrance of the Slave Trade', title_gu:'ગુલામ વેપાર સ્મરણ આંતરરાષ્ટ્રીય દિવસ',
    importance_en:'A UNESCO day to remember the victims of slavery and stand against modern exploitation.',
    importance_gu:'ગુલામીના પીડિતોને યાદ કરવા અને આધુનિક શોષણ સામે ઊભા રહેવા માટેનો UNESCO દિવસ.',
    points_en:['Remember the history of slavery','Stand against all exploitation','Promote equality and dignity','Learn from the past'],
    points_gu:['ગુલામીના ઇતિહાસને યાદ કરો','દરેક શોષણ સામે ઊભા રહો','સમાનતા અને ગૌરવને પ્રોત્સાહન આપો','ભૂતકાળમાંથી શીખો'],
    cta_en:'Remember, and stand against exploitation.', cta_gu:'યાદ કરો, અને શોષણ સામે ઊભા રહો.',
    hashtags:['SlaveTradeRemembrance','HumanRights','NeverForget'], icon:'scales', category:'Social'
  },
  'alzheimers-peace-day': {
    title_en:"World Alzheimer's Day / International Day of Peace", title_gu:'વિશ્વ અલ્ઝાઈમર દિવસ / આંતરરાષ્ટ્રીય શાંતિ દિવસ',
    importance_en:'Two observances: awareness of dementia and a global call for peace.',
    importance_gu:'બે ઉજવણી: ડિમેન્શિયા વિશે જાગૃતિ અને શાંતિ માટે વૈશ્વિક હાકલ.',
    points_en:['Notice early memory changes','Support people living with dementia','Promote peace in daily life','Resolve conflicts kindly'],
    points_gu:['વહેલા યાદશક્તિ ફેરફારને ઓળખો','ડિમેન્શિયા સાથે જીવતા લોકોને ટેકો આપો','રોજિંદા જીવનમાં શાંતિને પ્રોત્સાહન આપો','સંઘર્ષ દયાથી ઉકેલો'],
    cta_en:'Support memory care and choose peace.', cta_gu:'સ્મૃતિ સંભાળને ટેકો આપો અને શાંતિ પસંદ કરો.',
    hashtags:['WorldAlzheimersDay','DayOfPeace','DementiaAwareness'], icon:'brain', category:'Health & Peace'
  },
  'rivers-tourism-day': {
    title_en:'World Rivers Day / World Tourism Day', title_gu:'વિશ્વ નદી દિવસ / વિશ્વ પ્રવાસન દિવસ',
    importance_en:'Two observances: caring for our rivers and promoting responsible tourism.',
    importance_gu:'બે ઉજવણી: આપણી નદીઓની સંભાળ અને જવાબદાર પ્રવાસનને પ્રોત્સાહન.',
    points_en:['Keep rivers clean','Do not dump waste in water','Travel responsibly and respectfully','Support local communities'],
    points_gu:['નદીઓ સ્વચ્છ રાખો','પાણીમાં કચરો ન નાખો','જવાબદારી અને આદરથી મુસાફરી કરો','સ્થાનિક સમુદાયોને ટેકો આપો'],
    cta_en:'Protect rivers and travel responsibly.', cta_gu:'નદીઓનું રક્ષણ કરો અને જવાબદારીપૂર્વક મુસાફરી કરો.',
    hashtags:['WorldRiversDay','WorldTourismDay','Sustainability'], icon:'water', category:'Environment & Tourism'
  },
  'older-persons-blood-donation-day': {
    title_en:'National Voluntary Blood Donation Day / International Day of Older Persons', title_gu:'રાષ્ટ્રીય સ્વૈચ્છિક રક્તદાન દિવસ / આંતરરાષ્ટ્રીય વૃદ્ધજન દિવસ',
    importance_en:'Two observances: encouraging voluntary blood donation and honouring older persons.',
    importance_gu:'બે ઉજવણી: સ્વૈચ્છિક રક્તદાનને પ્રોત્સાહન અને વૃદ્ધજનોને સન્માન.',
    points_en:['Donate blood voluntarily','Respect and care for elders','Support older persons’ health','Value their wisdom and dignity'],
    points_gu:['સ્વૈચ્છિક રક્તદાન કરો','વડીલોનું સન્માન કરો અને સંભાળ લો','વૃદ્ધજનોના આરોગ્યને ટેકો આપો','તેમના જ્ઞાન અને ગૌરવને મૂલવો'],
    cta_en:'Donate blood and honour our elders.', cta_gu:'રક્તદાન કરો અને આપણા વડીલોને સન્માન આપો.',
    hashtags:['BloodDonation','OlderPersonsDay','Care'], icon:'elder', category:'Health & Social'
  },
  'world-animal-day': {
    title_en:'World Animal Day', title_gu:'વિશ્વ પ્રાણી દિવસ',
    importance_en:'A day to promote animal welfare and kindness to all creatures.',
    importance_gu:'પ્રાણી કલ્યાણ અને બધા જીવો પ્રત્યે દયાને પ્રોત્સાહન આપતો દિવસ.',
    points_en:['Treat animals with kindness','Care for pets responsibly','Protect wildlife and strays','Report animal cruelty'],
    points_gu:['પ્રાણીઓ સાથે દયાથી વર્તો','પાળતુ પ્રાણીઓની જવાબદારીપૂર્વક સંભાળ લો','વન્યજીવન અને રખડતા પ્રાણીઓનું રક્ષણ કરો','પ્રાણી ક્રૂરતાની જાણ કરો'],
    cta_en:'Be kind to animals — every life matters.', cta_gu:'પ્રાણીઓ પ્રત્યે દયાળુ બનો — દરેક જીવન મહત્વનું છે.',
    hashtags:['WorldAnimalDay','AnimalWelfare','BeKind'], icon:'leaf', category:'Environment'
  },
  'world-teachers-day': {
    title_en:"World Teachers' Day", title_gu:'વિશ્વ શિક્ષક દિવસ',
    importance_en:'A UNESCO day celebrating teachers worldwide for shaping learners and society.',
    importance_gu:'વિદ્યાર્થીઓ અને સમાજ ઘડવા બદલ વિશ્વભરના શિક્ષકોની ઉજવણી કરતો UNESCO દિવસ.',
    points_en:['Appreciate teachers everywhere','Support quality education','Value learning for life','Respect the teaching profession'],
    points_gu:['દરેક જગ્યાના શિક્ષકોની કદર કરો','ગુણવત્તાયુક્ત શિક્ષણને ટેકો આપો','જીવનભરના શિક્ષણને મૂલવો','શિક્ષણ વ્યવસાયનું સન્માન કરો'],
    cta_en:'Celebrate teachers who shape our future.', cta_gu:'આપણું ભવિષ્ય ઘડનાર શિક્ષકોની ઉજવણી કરો.',
    hashtags:['WorldTeachersDay','ThankATeacher','Education'], icon:'cap', category:'Education'
  },
  'world-post-day': {
    title_en:'World Post Day', title_gu:'વિશ્વ ટપાલ દિવસ',
    importance_en:'A UN day recognising the postal service’s role in connecting people and communities.',
    importance_gu:'લોકો અને સમુદાયોને જોડવામાં ટપાલ સેવાની ભૂમિકાને માન્યતા આપતો UN દિવસ.',
    points_en:['Value reliable postal services','Support access in remote areas','Appreciate postal workers','Use official services safely'],
    points_gu:['વિશ્વસનીય ટપાલ સેવાઓને મૂલવો','દૂરના વિસ્તારોમાં પહોંચને ટેકો આપો','ટપાલ કર્મચારીઓની કદર કરો','સત્તાવાર સેવાઓ સલામત રીતે વાપરો'],
    cta_en:'Connecting people — value the post.', cta_gu:'લોકોને જોડતું — ટપાલને મૂલવો.',
    hashtags:['WorldPostDay','PostalService','Connect'], icon:'news', category:'Communication'
  },
  'girl-child-day-intl': {
    title_en:'International Day of the Girl Child', title_gu:'આંતરરાષ્ટ્રીય બાળિકા દિવસ',
    importance_en:'A UN day for the rights, education, health and empowerment of girls.',
    importance_gu:'બાળિકાઓના અધિકારો, શિક્ષણ, આરોગ્ય અને સશક્તિકરણ માટેનો UN દિવસ.',
    points_en:['Support girls’ education','Protect girls from harm','Promote girls’ health','Believe in girls’ potential'],
    points_gu:['બાળિકાઓના શિક્ષણને ટેકો આપો','બાળિકાઓને નુકસાનથી બચાવો','બાળિકાઓના આરોગ્યને પ્રોત્સાહન આપો','બાળિકાઓની ક્ષમતામાં વિશ્વાસ રાખો'],
    cta_en:'Empower girls — invest in their future.', cta_gu:'બાળિકાઓને સશક્ત બનાવો — તેમના ભવિષ્યમાં રોકાણ કરો.',
    hashtags:['DayOfTheGirl','GirlPower','GirlsRights'], icon:'child', category:'Health & Social'
  },
  'disaster-risk-reduction-day': {
    title_en:'International Day for Disaster Risk Reduction', title_gu:'આપત્તિ જોખમ ઘટાડા આંતરરાષ્ટ્રીય દિવસ',
    importance_en:'A UN day to build awareness and preparedness that reduces the impact of disasters.',
    importance_gu:'આપત્તિઓની અસર ઘટાડતી જાગૃતિ અને તૈયારી બનાવવા માટેનો UN દિવસ.',
    points_en:['Know your local risks','Keep an emergency kit ready','Learn evacuation routes','Follow official warnings'],
    points_gu:['તમારા સ્થાનિક જોખમો જાણો','કટોકટી કીટ તૈયાર રાખો','ખાલી કરાવવાના માર્ગો શીખો','સત્તાવાર ચેતવણીઓનું પાલન કરો'],
    cta_en:'Be prepared — reduce disaster risk.', cta_gu:'તૈયાર રહો — આપત્તિ જોખમ ઘટાડો.',
    hashtags:['DRRDay','BeReady','Preparedness'], icon:'shield', category:'Safety'
  },
  'polio-un-day': {
    title_en:'United Nations Day / World Polio Day', title_gu:'સંયુક્ત રાષ્ટ્ર દિવસ / વિશ્વ પોલિયો દિવસ',
    importance_en:'Two observances: the founding of the UN and the global effort to end polio.',
    importance_gu:'બે ઉજવણી: સંયુક્ત રાષ્ટ્રની સ્થાપના અને પોલિયો નાબૂદીનો વૈશ્વિક પ્રયાસ.',
    points_en:['Support global cooperation','Vaccinate children against polio','Complete all polio doses','Help keep the world polio-free'],
    points_gu:['વૈશ્વિક સહકારને ટેકો આપો','બાળકોને પોલિયો સામે રસી અપાવો','બધા પોલિયો ડોઝ પૂર્ણ કરો','દુનિયાને પોલિયોમુક્ત રાખવામાં મદદ કરો'],
    cta_en:'End polio — vaccinate every child.', cta_gu:'પોલિયો નાબૂદ કરો — દરેક બાળકને રસી અપાવો.',
    hashtags:['UNDay','WorldPolioDay','EndPolio'], icon:'syringe', category:'Health & International'
  },
  'tsunami-awareness-day': {
    title_en:'World Tsunami Awareness Day', title_gu:'વિશ્વ સુનામી જાગૃતિ દિવસ',
    importance_en:'A UN day to raise awareness and preparedness for tsunamis in coastal areas.',
    importance_gu:'દરિયાકાંઠાના વિસ્તારોમાં સુનામી માટે જાગૃતિ અને તૈયારી લાવવા માટેનો UN દિવસ.',
    points_en:['Know tsunami warning signs','Move to higher ground quickly','Follow official alerts','Have a family evacuation plan'],
    points_gu:['સુનામી ચેતવણી ચિહ્નો જાણો','ઝડપથી ઊંચી જગ્યાએ જાઓ','સત્તાવાર ચેતવણીઓનું પાલન કરો','પરિવારની ખાલી કરાવવાની યોજના રાખો'],
    cta_en:'Be tsunami-ready — know and act.', cta_gu:'સુનામી માટે તૈયાર રહો — જાણો અને પગલાં લો.',
    hashtags:['TsunamiAwarenessDay','BeReady','Safety'], icon:'water', category:'Safety'
  },
  'science-for-peace-day': {
    title_en:'World Science Day for Peace and Development', title_gu:'શાંતિ અને વિકાસ માટે વિશ્વ વિજ્ઞાન દિવસ',
    importance_en:'A UNESCO day highlighting science’s role in society, peace and development.',
    importance_gu:'સમાજ, શાંતિ અને વિકાસમાં વિજ્ઞાનની ભૂમિકા દર્શાવતો UNESCO દિવસ.',
    points_en:['Value science for society','Support evidence-based decisions','Encourage science education','Use science responsibly'],
    points_gu:['સમાજ માટે વિજ્ઞાનને મૂલવો','પુરાવા-આધારિત નિર્ણયોને ટેકો આપો','વિજ્ઞાન શિક્ષણને પ્રોત્સાહન આપો','વિજ્ઞાનનો જવાબદારીપૂર્વક ઉપયોગ કરો'],
    cta_en:'Science for peace and a better world.', cta_gu:'શાંતિ અને સારી દુનિયા માટે વિજ્ઞાન.',
    hashtags:['ScienceDay','ScienceForPeace','Development'], icon:'atom', category:'Science'
  },
  'children-diabetes-day': {
    title_en:"Children's Day / World Diabetes Day", title_gu:'બાળ દિવસ / વિશ્વ ડાયાબિટીસ દિવસ',
    importance_en:'Two observances: celebrating children (Nehru’s birthday in India) and diabetes awareness.',
    importance_gu:'બે ઉજવણી: બાળકોની ઉજવણી (ભારતમાં નહેરુનો જન્મદિન) અને ડાયાબિટીસ જાગૃતિ.',
    points_en:['Nurture children’s health and joy','Encourage active, balanced habits','Know the signs of diabetes','Support prevention and care'],
    points_gu:['બાળકોના આરોગ્ય અને આનંદને પોષો','સક્રિય, સંતુલિત આદતોને પ્રોત્સાહન આપો','ડાયાબિટીસના ચિહ્નો જાણો','નિવારણ અને સંભાળને ટેકો આપો'],
    cta_en:'Healthy, happy children — and diabetes awareness.', cta_gu:'સ્વસ્થ, ખુશ બાળકો — અને ડાયાબિટીસ જાગૃતિ.',
    hashtags:['ChildrensDay','WorldDiabetesDay','HealthForAll'], icon:'child', category:'Health & National'
  },
  'toilet-mens-day': {
    title_en:"World Toilet Day / International Men's Day", title_gu:'વિશ્વ શૌચાલય દિવસ / આંતરરાષ્ટ્રીય પુરુષ દિવસ',
    importance_en:'Two observances: safe sanitation for all and the health and wellbeing of men and boys.',
    importance_gu:'બે ઉજવણી: બધા માટે સલામત સ્વચ્છતા અને પુરુષો તથા છોકરાઓનું આરોગ્ય અને સુખાકારી.',
    points_en:['Use and maintain safe toilets','Support sanitation for everyone','Encourage men to seek health care','Talk about men’s mental health'],
    points_gu:['સલામત શૌચાલય વાપરો અને જાળવો','દરેક માટે સ્વચ્છતાને ટેકો આપો','પુરુષોને આરોગ્ય સંભાળ લેવા પ્રોત્સાહિત કરો','પુરુષોના માનસિક આરોગ્ય વિશે વાત કરો'],
    cta_en:'Safe sanitation for all, healthy men and boys.', cta_gu:'બધા માટે સલામત સ્વચ્છતા, સ્વસ્થ પુરુષો અને છોકરાઓ.',
    hashtags:['WorldToiletDay','MensDay','Sanitation'], icon:'shield', category:'Health & Social'
  },
  'universal-childrens-day': {
    title_en:"Universal Children's Day", title_gu:'વિશ્વવ્યાપી બાળ દિવસ',
    importance_en:'A UN day promoting the rights, welfare and wellbeing of every child.',
    importance_gu:'દરેક બાળકના અધિકારો, કલ્યાણ અને સુખાકારીને પ્રોત્સાહન આપતો UN દિવસ.',
    points_en:['Protect every child’s rights','Ensure education and health','Listen to children’s voices','Keep children safe from harm'],
    points_gu:['દરેક બાળકના અધિકારોનું રક્ષણ કરો','શિક્ષણ અને આરોગ્ય સુનિશ્ચિત કરો','બાળકોના અવાજ સાંભળો','બાળકોને નુકસાનથી સલામત રાખો'],
    cta_en:'Every child, every right.', cta_gu:'દરેક બાળક, દરેક અધિકાર.',
    hashtags:['ChildrensDay','ChildRights','ForEveryChild'], icon:'child', category:'Social'
  },
  'world-fisheries-day': {
    title_en:'World Fisheries Day', title_gu:'વિશ્વ મત્સ્યઉદ્યોગ દિવસ',
    importance_en:'A day highlighting healthy fisheries and the livelihoods of fishing communities.',
    importance_gu:'સ્વસ્થ મત્સ્યઉદ્યોગ અને માછીમાર સમુદાયોની આજીવિકા દર્શાવતો દિવસ.',
    points_en:['Support sustainable fishing','Protect rivers, lakes and seas','Respect fishing communities','Avoid overfishing and waste'],
    points_gu:['ટકાઉ માછીમારીને ટેકો આપો','નદીઓ, તળાવો અને દરિયાનું રક્ષણ કરો','માછીમાર સમુદાયોનું સન્માન કરો','અતિમાછીમારી અને બગાડ ટાળો'],
    cta_en:'Sustain our waters — support fisheries.', cta_gu:'આપણા જળનું જતન કરો — મત્સ્યઉદ્યોગને ટેકો આપો.',
    hashtags:['WorldFisheriesDay','Sustainable','BlueEconomy'], icon:'water', category:'Environment & Livelihood'
  },
  'anti-corruption-day': {
    title_en:'International Anti-Corruption Day', title_gu:'આંતરરાષ્ટ્રીય ભ્રષ્ટાચાર વિરોધી દિવસ',
    importance_en:'A UN day to fight corruption and promote honesty, transparency and accountability.',
    importance_gu:'ભ્રષ્ટાચાર સામે લડવા અને પ્રામાણિકતા, પારદર્શિતા તથા જવાબદારીને પ્રોત્સાહન આપવા માટેનો UN દિવસ.',
    points_en:['Refuse to give or take bribes','Report corruption','Demand transparency','Support honest institutions'],
    points_gu:['લાંચ આપવા કે લેવાનો ઇનકાર કરો','ભ્રષ્ટાચારની જાણ કરો','પારદર્શિતાની માંગ કરો','પ્રામાણિક સંસ્થાઓને ટેકો આપો'],
    cta_en:'Say no to corruption — choose integrity.', cta_gu:'ભ્રષ્ટાચારને ના કહો — પ્રામાણિકતા પસંદ કરો.',
    hashtags:['AntiCorruptionDay','Integrity','Transparency'], icon:'scales', category:'Governance'
  },
  'human-rights-day': {
    title_en:'Human Rights Day', title_gu:'માનવ અધિકાર દિવસ',
    importance_en:'A UN day upholding the rights and dignity that belong to every person.',
    importance_gu:'દરેક વ્યક્તિના અધિકારો અને ગૌરવ જાળવતો UN દિવસ.',
    points_en:['Respect the rights of all','Stand against injustice','Promote equality and dignity','Know and defend your rights'],
    points_gu:['બધાના અધિકારોનું સન્માન કરો','અન્યાય સામે ઊભા રહો','સમાનતા અને ગૌરવને પ્રોત્સાહન આપો','તમારા અધિકારો જાણો અને બચાવો'],
    cta_en:'Dignity and rights for all.', cta_gu:'બધા માટે ગૌરવ અને અધિકાર.',
    hashtags:['HumanRightsDay','StandUp4HumanRights','Dignity'], icon:'scales', category:'Rights'
  },
  'international-mountain-day': {
    title_en:'International Mountain Day', title_gu:'આંતરરાષ્ટ્રીય પર્વત દિવસ',
    importance_en:'A UN day recognising mountains for water, biodiversity and the communities they support.',
    importance_gu:'પાણી, જૈવવિવિધતા અને તે ટકાવતા સમુદાયો માટે પર્વતોને માન્યતા આપતો UN દિવસ.',
    points_en:['Protect mountain ecosystems','Support mountain communities','Reduce pollution and waste','Travel responsibly in hills'],
    points_gu:['પર્વતીય ઇકોસિસ્ટમનું રક્ષણ કરો','પર્વતીય સમુદાયોને ટેકો આપો','પ્રદૂષણ અને કચરો ઘટાડો','પહાડોમાં જવાબદારીપૂર્વક મુસાફરી કરો'],
    cta_en:'Protect mountains — they sustain life.', cta_gu:'પર્વતોનું રક્ષણ કરો — તે જીવન ટકાવે છે.',
    hashtags:['MountainDay','ProtectMountains','Nature'], icon:'tree', category:'Environment'
  },
  'international-migrants-day': {
    title_en:'International Migrants Day', title_gu:'આંતરરાષ્ટ્રીય સ્થળાંતરિત દિવસ',
    importance_en:'A UN day recognising the rights and contributions of migrants everywhere.',
    importance_gu:'દરેક જગ્યાના સ્થળાંતરિતોના અધિકારો અને યોગદાનને માન્યતા આપતો UN દિવસ.',
    points_en:['Respect the dignity of migrants','Reject prejudice and exploitation','Value their contributions','Support safe, fair migration'],
    points_gu:['સ્થળાંતરિતોના ગૌરવનું સન્માન કરો','પૂર્વગ્રહ અને શોષણને નકારો','તેમના યોગદાનને મૂલવો','સલામત, ન્યાયી સ્થળાંતરને ટેકો આપો'],
    cta_en:'Respect and support migrants everywhere.', cta_gu:'દરેક જગ્યાના સ્થળાંતરિતોનું સન્માન કરો અને ટેકો આપો.',
    hashtags:['MigrantsDay','MigrationWithDignity','HumanRights'], icon:'globe', category:'Social'
  }
};
Object.assign(TOPIC_CONTENT, OFFICIAL_REST_CONTENT);

// Studio themes cycle to fill non-observance days.
const NON_STUDIO = Object.assign({}, OFFICIAL_HEALTH_CONTENT, MOVABLE_CONTENT, OFFICIAL_MIXED_CONTENT, OFFICIAL_CIVIC_CONTENT, OFFICIAL_CIVIC2_CONTENT, OFFICIAL_REST_CONTENT);
const STUDIO_THEME_IDS = Object.keys(TOPIC_CONTENT).filter(k => !NON_STUDIO[k]);

// ---- Movable observance rules (year-aware) ----
// occurrence: 1..5 nth weekday; 'last' = last weekday. weekday 0=Sun..6=Sat.
const MOVABLE_OBSERVANCES = [
  { topicId:'mothers-day',   title_en:"Mother's Day",       rule:{month:5, weekday:0, occurrence:2},  observanceType:'recognised-health', authorities:[] },
  { topicId:'fathers-day',   title_en:"Father's Day",       rule:{month:6, weekday:0, occurrence:3},  observanceType:'recognised-health', authorities:[] },
  { topicId:'world-kidney-day', title_en:'World Kidney Day', rule:{month:3, weekday:4, occurrence:2}, observanceType:'recognised-health', authorities:[] },
  { topicId:'world-leprosy-day', title_en:'World Leprosy Day', rule:{month:1, weekday:0, occurrence:'last'}, observanceType:'recognised-health', authorities:[] }
];

function resolveMovable(year) {
  const map = {};
  for (const m of MOVABLE_OBSERVANCES) {
    const date = m.rule.occurrence === 'last'
      ? lastWeekdayOfMonth(year, m.rule.month, m.rule.weekday)
      : nthWeekdayOfMonth(year, m.rule.month, m.rule.weekday, m.rule.occurrence);
    if (date) map[date] = m;
  }
  return map;
}

// ---- Content-coverage validation (B) ----
const GENERIC_MARKERS = ['[generic]', 'category default'];
function validateContentCoverage(calendar) {
  const failures = [];
  for (const row of calendar) {
    const c = row.content;
    const where = row.date + ' (' + (row.topicId || '?') + ')';
    if (!c) { failures.push({ date: row.date, topic: row.topicId, reason: 'no dedicated content object' }); continue; }
    if (!c.title_gu || !c.title_gu.trim()) failures.push({ date: row.date, topic: c.title_en, reason: 'missing Gujarati title' });
    else if (c.title_gu.trim() === (c.title_en || '').trim()) failures.push({ date: row.date, topic: c.title_en, reason: 'Gujarati title identical to English' });
    if (!c.importance_en || !c.importance_en.trim()) failures.push({ date: row.date, topic: c.title_en, reason: 'blank importance_en' });
    if (!c.importance_gu || !c.importance_gu.trim()) failures.push({ date: row.date, topic: c.title_en, reason: 'missing Gujarati importance' });
    else if (c.importance_gu.trim() === (c.importance_en || '').trim()) failures.push({ date: row.date, topic: c.title_en, reason: 'Gujarati importance identical to English' });
    if (!Array.isArray(c.points_en) || c.points_en.length !== 4 || c.points_en.some(p => !p || !p.trim())) failures.push({ date: row.date, topic: c.title_en, reason: 'need 4 non-empty English key points' });
    if (!Array.isArray(c.points_gu) || c.points_gu.length !== 4 || c.points_gu.some(p => !p || !p.trim())) failures.push({ date: row.date, topic: c.title_en, reason: 'need 4 non-empty Gujarati key points' });
    else if (Array.isArray(c.points_en) && c.points_gu.every((g, i) => g.trim() === (c.points_en[i] || '').trim())) failures.push({ date: row.date, topic: c.title_en, reason: 'Gujarati points identical to English' });
    if (!c.cta_en || !c.cta_en.trim()) failures.push({ date: row.date, topic: c.title_en, reason: 'missing English CTA' });
    if (!c.cta_gu || !c.cta_gu.trim()) failures.push({ date: row.date, topic: c.title_en, reason: 'missing Gujarati CTA' });
    if (!Array.isArray(c.hashtags) || c.hashtags.length === 0) failures.push({ date: row.date, topic: c.title_en, reason: 'missing hashtags' });
    if (!c.category || !c.category.trim()) failures.push({ date: row.date, topic: c.title_en, reason: 'missing category' });
    if (!c.icon || !c.icon.trim()) failures.push({ date: row.date, topic: c.title_en, reason: 'missing icon' });
    if (GENERIC_MARKERS.some(m => JSON.stringify(c).includes(m))) failures.push({ date: row.date, topic: c.title_en, reason: 'unresolved generic fallback content' });
  }
  return failures;
}

module.exports = {
  nthWeekdayOfMonth, lastWeekdayOfMonth, slugify,
  TOPIC_CONTENT, STUDIO_THEME_IDS, MOVABLE_OBSERVANCES, resolveMovable,
  validateContentCoverage
};
