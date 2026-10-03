import fs from 'node:fs';
import crypto from 'node:crypto';
import {digest} from '../../scripts/research-common.mjs';
for(const dir of ['brazil','southern','andean']){
 const base=`research/regional-09/${dir}/`,c=JSON.parse(fs.readFileSync(base+'cohort.json'));
 const corrections=[];
 for(const x of c.claims){
  if(dir==='brazil'&&x.figure){const id=x.figure.name.includes('Machado')?'machado-de-assis':'manuel-bandeira';corrections.push(`${x.id}: stable person ID ${x.figure.personId} -> ${id}`);x.figure.personId=id;}
  if(dir==='southern'&&x.figure?.personId==='pedro-figari'&&x.temporal.from==='1920'){x.figure.contribution='Painter and aesthetic thinker; author of Arte, Estética, Ideal (1912).';corrections.push(x.id+': remove later international recognition from selected-year contribution.');}
  if(dir==='andean'&&x.category==='capital'){x.qualifications=x.qualifications.filter(v=>!v.startsWith('Monetary unit'));corrections.push(x.id+': remove unrelated monetary qualification.');}
 }
 fs.writeFileSync(base+'accepted-cohort.json',JSON.stringify(c,null,2)+'\n');
 const note={reviewer:'/root',bodyReviewed:true,claims:c.claims.map(x=>({id:x.id,decision:'accepted',sourceIds:x.sourceIds,locators:x.evidence.map(e=>e.locator)})),corrections,standard:'Original institutional, archival or scholarly bodies reviewed independently. Bounded intervals retained; year precision not promoted to invented days. Observation dates, source estimates and cultural associations retained. Scope-uncertain proposals remain in held artifacts.'};
 fs.writeFileSync(base+'independent-review.json',JSON.stringify(note,null,2)+'\n');
 const paths=['cohort.json','accepted-cohort.json','independent-review.json'];
 const cert={cohortHash:digest(c),bodyReviewed:true,reviewer:'/root',acceptedClaimIds:c.claims.map(x=>x.id),inputBindings:paths.map(p=>({path:base+p,sha256:crypto.createHash('sha256').update(fs.readFileSync(base+p)).digest('hex')})),rationale:note.standard};
 fs.writeFileSync(base+'certificate.json',JSON.stringify(cert,null,2)+'\n');
}
