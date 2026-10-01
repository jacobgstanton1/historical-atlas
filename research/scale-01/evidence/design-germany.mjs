import{create,interval,event}from'./design-build.mjs';
const{source,claim,body,finish}=create(4);
const parliament=source('b03-german-imperial','Kaiserreich1871–1918','German Bundestag','https://www.bundestag.de/parlament/geschichte/parlamentarismus/kaiserreich','Full institutional narrative, franchise, government control and party-system body read.');
for(const[key,from,until,loc,value]of[
 ['executive','1872','1890','Openingconstitutionalparagraph','The emperor’s confidence determined government appointments; military, foreign policy and administration largely escaped parliamentary influence.'],
 ['federal-legislation','1872','1890','Bundesrat/Reichstagparagraphs','The Bundesrat represented member states; it and the Reichstag approved legislation and annual budgets. The Reichstag could initiate bills and question government policy.'],
 ['franchise','1872','1890','Reichstagswahlrecht','Reichstag elections were direct, equal and secret for male Germans over25; women lacked voting rights.'],
 ['term-early','1872','1887','Reichstagswahlrecht','Reichstag deputies were elected for three-year terms.'],
 ['term-later','1889','1890','Reichstagswahlrecht','Reichstag terms were five years after the1888 change.'],
 ['party-system','1872','1890','Parteiensystem','Conservative, Catholic Centre, liberal and socialist parties represented distinct social and ideological constituencies; stable lasting parliamentary alliances were absent.']])claim(key,'political-institutional',value,interval(from,until),parliament,loc,'Institutional account bounded to selectedperiod; disputed parliamentary evolution remains interpretive.',{metric:key.startsWith('term-')?'reichstag-term':key});
const bismarck=source('s01-dhm-bismarck','Otto von Bismarck','Deutsches Historisches Museum','https://www.dhm.de/lemo/biografie/otto-bismarck','Full1871–1890 chronological body read; dateprecision explicit.');
claim('bismarck','leadership','Otto von Bismarck',interval('1872','1890-03-20'),bismarck,'1871appointment;1890dismissal','Empire chancellor appointment21March1871 to20March1890; start clipped.',{role:'reich chancellor'});
for(const[key,date,value]of[
 ['kulturkampf','1872-05-14','Bismarck’s Canossa speech affirmed his confrontation with Catholic political and church influence.'],
 ['three-emperors','1873-10-22','The Three Emperors’ Agreement linked Germany, Austria and Russia within Bismarck’s diplomatic system.'],
 ['war-in-sight','1875','The War-in-Sight crisis with France was eased by British and Russian diplomacy.'],
 ['berlin-congress','1878-06','Bismarck convened the Berlin Congress to address the Balkan crisis.'],
 ['socialist-law','1878-10-18','The Anti-Socialist Law targeted socialist political organisation; it did not permanently destroy the movement.'],
 ['health-law','1883','The health-insurance law extended the developing social-insurance system.'],
 ['accident-law','1884','Accident insurance joined the social-insurance legislation.'],
 ['pension-law','1889','Invalidity and old-age insurance completed another major social-insurance measure.'],
 ['bismarck-dismissal','1890-03-20','WilhelmII dismissed Bismarck after conflicts over policy and ministerial relations with the Crown.']])claim(key,'events-context',value,event(date),bismarck,'Datedchronology1872–1890','No fabricated continuousstatistic or geometry-derivedrelationship.');
body(parliament,'Institutionalparagraphs,franchise,party-system','Full relevant body read; transition1888 preserved as gap.');body(bismarck,'Chronology1871–1890','Fullyearentries read including appointment anddismissal.');
finish({leadership:['Caprivi after20March1890 not accepted without separate bounded source.'],'political-institutional':['1888 Reichstag term-change exact effective date remains unresolved.'],'important-figures':['No cultural biography accepted; chancellor already recorded as leadership, not duplicated to inflate count.'],'population-statistics':['No geographic-scope-reconciled census accepted.']});
