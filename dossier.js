const node = (tag, text, className) => {
  const element = document.createElement(tag);
  if (text !== undefined && text !== null) element.textContent = String(text);
  if (className) element.className = className;
  return element;
};
export function period(fact) {
  if (!fact.validFrom && !fact.validUntil) return '';
  return (fact.validFrom || 'Start not curated') + ' – ' +
    (fact.validUntil ? (fact.validUntil.length === 10 ? 'before ' : 'ends during ') + fact.validUntil : 'end not curated');
}
export function renderDossier(container, context) {
  const {stableId, savedName, features, year, snapshotYear, metadata, presence,
    selectRelated, goYear, findBoundaries, boundaryIndex, currentMapIds,
    minYear, maxYear} = context;
  const resolved = metadata?.resolve(stableId, year) || {};
  const {entity} = resolved;
  const used = new Map(), registry = metadata?.registry || new Map();
  const content = node('div');
  const markers = (element, sourceIds = []) => {
    for (const id of sourceIds) {
      if (!registry.has(id)) continue;
      if (!used.has(id)) used.set(id, used.size + 1);
      const link = node('a', '[' + used.get(id) + ']', 'fact-source');
      link.href = '#dossier-source-' + id;
      link.setAttribute('aria-label', 'Source ' + used.get(id) + ': ' + registry.get(id).title);
      element.append(' ', link);
    }
    return element;
  };
  const section = title => {
    const s = node('section', undefined, 'dossier-section');
    s.append(node('h2', title)); content.append(s); return s;
  };
  const row = (list, label, value, facts = [], detail = '') => {
    if (value === undefined || value === null || value === '') return;
    const wrapper = node('div', undefined, 'dossier-row');
    const dd = node('dd', value);
    markers(dd, facts.flatMap(f => f.sourceIds || []));
    if (detail) dd.append(node('small', detail, 'fact-context'));
    wrapper.append(node('dt', label), dd); list.append(wrapper);
  };
  const listSection = title => { const s = section(title), dl = node('dl'); s.append(dl); return dl; };
  const values = (field, label, dl) => {
    for (const f of resolved[field] || []) row(dl, f.label || label, f.value, [f],
      [period(f), f.note].filter(Boolean).join(' · '));
  };
  const name = resolved.names?.find(f => f.kind === 'primary')?.value || savedName || stableId;
  content.append(node('div', 'Historical Territory Dossier', 'inspector-kicker'));
  const heading = node('h1', name); heading.id = 'territory-name';
  markers(heading, resolved.names?.find(f => f.kind === 'primary')?.sourceIds || ['basemaps']);
  content.append(heading);
  for (const f of resolved.names || []) if (f.kind !== 'primary')
    content.append(markers(node('p', f.value, 'dossier-alternate'), f.sourceIds));
  const status = (resolved.politicalStatus || []).map(f => f.value).join('; ');
  content.append(markers(node('p', (status ? status + ' · ' : '') + year + ' CE · selected year', 'dossier-year'),
    (resolved.politicalStatus || []).flatMap(f => f.sourceIds || [])));
  if (!features.length) {
    content.append(node('p', 'This selected map identity is not present in the ' + snapshotYear +
      ' boundary snapshot. No successor has been selected.', 'dossier-notice'));
  }
  if (resolved.ambiguous) content.append(node('p',
    'The selected calendar year spans more than one curated identity. Metadata is omitted until a more precise date can be selected.',
    'dossier-notice'));
  for (const flag of resolved.flags || []) {
    const figure = node('figure', undefined, 'dossier-flag');
    const img = node('img'); img.src = flag.asset; img.alt = flag.alt || flag.value;
    img.addEventListener('error', () => figure.remove(), {once:true});
    const caption = markers(node('figcaption', [flag.value, period(flag), flag.note, flag.license + ' · ' + flag.attribution].filter(Boolean).join(' · ')), flag.sourceIds);
    figure.append(img, caption); content.append(figure);
  }
  const keyFields = ['politicalStatus','capitals','population','area','currencies'];
  if (keyFields.some(k => resolved[k]?.length) || entity?.existence) {
    const dl = listSection('Key Facts');
    if (entity?.existence) row(dl, 'Existence', (entity.existence.validFrom || 'Start not curated') +
      ' – ' + (entity.existence.validUntil || 'End not curated'), [entity.existence], entity.existence.note);
    values('politicalStatus','Political status',dl); values('capitals','Capital',dl);
    for (const f of [...(resolved.population || []), ...(resolved.area || [])]) row(dl,
      f.metric || 'Area', typeof f.value === 'number' ? f.value.toLocaleString('en-US') + (f.unit ? ' ' + f.unit : '') : f.value,
      [f], [f.asOf ? f.asOf + ' ' + (f.observationType || 'observation') : period(f), f.scope,
        f.asOf && Number(f.asOf.slice(0,4)) !== year ? 'Earlier observation; no interpolation' : '',
        f.note].filter(Boolean).join(' · '));
    values('currencies','Currency',dl);
  }
  if (resolved.governments?.length || resolved.leaders?.length) {
    const dl = listSection('Politics and Leadership');
    values('governments','Government',dl);
    for (const f of resolved.leaders || []) {
      row(dl,f.role || 'Leadership',f.value,[f],[period(f),f.note].filter(Boolean).join(' · '));
      if (f.party) row(dl,'Leader’s party',f.party,[f]);
      if (f.dynasty) row(dl,'Dynasty',f.dynasty,[f]);
      if (f.legislature) row(dl,'Legislature',f.legislature,[f]);
    }
  }
  if (resolved.economy?.length) {
    const dl = listSection('Population and Economy');
    for (const f of resolved.economy) row(dl,f.metric,f.value + (f.unit ? ' ' + f.unit : ''),[f],
      [f.asOf,f.observationType,f.scope,f.note,'No interpolation'].filter(Boolean).join(' · '));
  }
  const related = (target, parent) => {
    const mapId = (target.mapIds || []).find(id => currentMapIds.has(id));
    if (mapId) {
      const button = node('button',target.value,'dossier-link'); button.type = 'button';
      button.addEventListener('click',() => selectRelated(mapId)); parent.append(button);
    } else parent.append(node('span',target.value),node('small','Not represented as this identity in the current snapshot','fact-context'));
    markers(parent,target.sourceIds);
    if (target.date) parent.append(node('small',target.date + (target.note ? ' · ' + target.note : ''),'fact-context'));
    else if (target.note) parent.append(node('small',target.note,'fact-context'));
  };
  const rawRelations = [];
  for (const feature of features) {
    const p = feature.properties || {};
    // The normalized authority may default to NAME; only original supplied
    // fields are evidence of a relationship. Include self-references honestly.
    for (const [field,label] of [['SUBJECTO','SUBJECTO (source authority)'],['PARTOF','PARTOF (source grouping)'],
      ['authority','Authority (source)'],['part_of','Part of (source)']]) {
      if (p[field] && !rawRelations.some(r => r.type === label && r.value === p[field]))
        rawRelations.push({type:label,value:p[field],sourceIds:['basemaps'],mapIds:[]});
    }
  }
  if (rawRelations.length || resolved.relationships?.length) {
    const s = section('Relationships');
    for (const f of [...(resolved.relationships || []),...rawRelations]) {
      const p = node('p',undefined,'relationship-row'); p.append(node('strong',f.type + ': '));
      // Only exact source names or explicitly curated aliases are eligible.
      // Ambiguous aliases deliberately leave the relationship unavailable.
      const candidates = [...new Set(context.allFeatures.filter(feature =>
        feature.properties?._name === f.value ||
        metadata?.searchTerms(feature.properties?._stableId, year).includes(f.value)
      ).map(feature => feature.properties._stableId))];
      const target = f.mapIds?.length ? f : {...f,mapIds:candidates.length === 1 ? candidates : []};
      related(target,p); s.append(p);
    }
    s.append(node('p','Source authority and grouping are not assertions of sovereignty or constitutional status.','dossier-muted'));
  }
  if (resolved.descriptions?.length) {
    const s = section('Overview');
    for (const f of resolved.descriptions) {
      s.append(markers(node('p',f.value),f.sourceIds),node('small',period(f),'fact-context'));
    }
  }
  if (resolved.events?.length) {
    const s = section('History / Timeline'), ol = node('ol',undefined,'dossier-events');
    for (const e of [...resolved.events].sort((a,b) => a.date.localeCompare(b.date))) {
      const eventYear = Number(e.date.slice(0,4)), li = node('li',undefined,eventYear === year ? 'is-selected-year' : '');
      li.append(node('time',e.date),markers(node('strong',e.title),e.sourceIds));
      if (e.note) li.append(node('small',e.note,'fact-context'));
      if (eventYear > year) li.append(node('small','After selected year','fact-context'));
      if (eventYear >= minYear && eventYear <= maxYear && eventYear !== year) {
        const b = node('button','View in ' + eventYear,'dossier-link'); b.type='button';
        b.addEventListener('click',() => goYear(eventYear)); li.append(b);
      }
      ol.append(li);
    }
    s.append(ol);
  }
  if (resolved.predecessors?.length || resolved.successors?.length) {
    const s = section('Predecessors / Successors');
    for (const [field,label] of [['predecessors','Preceded by'],['successors','Succeeded by']])
      for (const f of resolved[field] || []) { const p=node('p'); p.append(node('strong',label + ': ')); related(f,p); s.append(p); }
    s.append(node('p','Curated transitions; related links preserve the selected year.','dossier-muted'));
  }
  const boundary = section('Boundary History');
  boundary.append(node('p','Changes between available mapped snapshots; these do not establish the date of a real historical border change.','dossier-muted'));
  const navigation = node('div',undefined,'boundary-navigation');
  navigation.append(node('p',features.length ? 'Checking available mapped snapshots…' : 'Unavailable while this identity is absent.'));
  boundary.append(navigation);
  const dl = listSection('Map Data');
  row(dl,'Requested year',year);
  row(dl,'Boundary snapshot',snapshotYear + (context.boundaryLoadFailed ? ' · retained snapshot; requested boundary file unavailable' : year === snapshotYear ? ' · exact snapshot year' : ' · nearest available snapshot'));
  row(dl,'Source','Historical Basemaps',[{sourceIds:['basemaps']}]);
  const precision = [...new Set(features.map(f => f.properties?._confidenceLabel || 'Unspecified'))];
  row(dl,'Boundary precision',precision.length > 1 ? 'Mixed: ' + precision.join('; ') : precision[0] || 'No geometry in this snapshot',[{sourceIds:['basemaps']}]);
  row(dl,'Available-map presence',presence,[{sourceIds:['basemaps']}]);
  row(dl,'Map identity',stableId);
  if (!entity) content.append(node('p',context.metadataError ?
    'Historical metadata could not be loaded. Map-derived information remains available.' :
    'Additional historical metadata has not yet been curated for this identity and selected year.','dossier-muted'));
  const sources = section('Sources'), ol = node('ol',undefined,'dossier-sources');
  for (const [id,number] of used) {
    const source = registry.get(id), li=node('li'); li.id='dossier-source-'+id; li.value=number;
    const link=node('a',source.title); link.href=source.url; link.target='_blank'; link.rel='noopener noreferrer';
    li.append(link,node('small',[source.institution,source.publicationDate,source.datasetVersion,
      'Accessed '+source.accessed,source.license,source.attribution,source.usage].filter(Boolean).join(' · '),'fact-context'));
    ol.append(li);
  }
  // The map source remains linked even if the separate metadata service fails.
  if (!used.has('basemaps')) {
    const li=node('li'),a=node('a','Historical Basemaps'); a.href='https://github.com/aourednik/historical-basemaps';
    a.target='_blank'; a.rel='noopener noreferrer'; li.append(a); ol.append(li);
  }
  sources.append(ol);
  container.replaceChildren(content);
  if (features.length) findBoundaries(stableId,boundaryIndex).then(result => {
    if (!navigation.isConnected) return;
    navigation.replaceChildren();
    if (result.absent) { navigation.append(node('p','No mapped geometry for this identity.')); return; }
    for (const [key,label] of [['previous','Previous mapped change'],['next','Next mapped change']]) {
      const change=result[key];
      if (change) { const b=node('button',label+' · '+change.year,'dossier-link'); b.type='button';
        b.addEventListener('click',() => goYear(change.year)); navigation.append(b); }
      else navigation.append(node('p',label+': '+(result.incomplete?'not established':'none in available snapshots'),'dossier-muted'));
    }
    if (result.incomplete) navigation.append(node('p','Some snapshot files could not be checked.','dossier-muted'));
  }).catch(() => {
    if (navigation.isConnected) navigation.replaceChildren(node('p','Boundary history is temporarily unavailable.','dossier-muted'));
  });
}
