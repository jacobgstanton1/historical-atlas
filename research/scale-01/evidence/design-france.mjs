import{create,interval,event}from'./design-build.mjs';
const{source,claim,body,finish}=create(3);
const senate=source('b01-france-third-republic','1875–1940:Le Sénat républicain','French Senate','https://www.senat.fr/connaitre-le-senat/lhistoire-du-senat/1875-1940-le-senat-republicain.html','Complete institutional history and contemporary figure sections read.');
for(const[key,from,until,loc,value]of[
 ['executive','1876','1890','Openingconstitutionalparagraphs','Parliament elected the president; ministers countersigned presidential acts and were responsible to the chambers. Senate assent was needed for dissolution.'],
 ['senate-design','1876','1883','Senatecompositionparagraph','The Senate combined indirectly elected nine-year seats renewed by thirds with75 irremovable seats; its powers matched the deputies’ chamber.'],
 ['high-court','1876','1890','HighCourtparagraph','The Senate could sit as a High Court for presidential or ministerial treason and offences against state security.']])claim(key,'political-institutional',value,interval(from,until),senate,loc,'Conservative full years after1875 constitutional transition.',{metric:key});
for(const[key,date,value]of[
 ['republican-senate','1879-01','Republicans gained predominance in the Senate at its first renewal by thirds.'],
 ['paris-parliament','1879-07-22','The chambers decided to return from Versailles to Paris.'],
 ['school-reform','1882','School reforms across1881–1882 established free, secular and compulsory education.'],
 ['senate-reform','1884-08','Constitutional revision ended recruitment of irremovable senators; existing life seats were not instantly abolished.'],
 ['tirard','1890','Tirard’s cabinet withdrew in the face of Senate opposition.']])claim(key,'events-context',value,event(date),senate,'1877–1879test /1879–1899debate sections','Only selected-year event and explicitly dated contextual sequence.');
claim('schoelcher','important-figures','Victor Schœlcher defended republican liberties as an irremovable senator.',interval('1876','1890'),senate,'VictorSchoelcher1804–1893section','Post1875fullyears; earlier abolition achievement contextual, not invented activity eachyear.',{figure:{personId:'victor-schoelcher',name:'Victor Schœlcher',categories:['reformer','politician'],lifespan:{from:'1804',until:'1893'},relationship:'French senator; returned from exile in1870.',activity:'Senator appointed1875; opposed MacMahon’s dissolution1877 and defended liberties until1893.',contribution:'Defence of republican liberties within the Senate.'}});
body(senate,'Institutional history1875–1890 andSchœlcher biography','Full body reviewed; later1901association law and Dreyfus period excluded fromselectedyears.');
finish({leadership:['Existing dated presidents reused; complete cabinet sequence remains open.'], 'political-institutional':['Post1884 replacement rate for surviving life senators needs additional law evidence.'],'population-statistics':['No reconciled dated population accepted.']});
