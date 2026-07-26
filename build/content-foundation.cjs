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

// Studio themes cycle to fill non-observance days.
const STUDIO_THEME_IDS = Object.keys(TOPIC_CONTENT).filter(k => !OFFICIAL_HEALTH_CONTENT[k]);

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
