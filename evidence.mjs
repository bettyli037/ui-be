export function isValidId(id)
{
  const [url, type] = idToTypeAndUrl(id);
  const isValid = !!url && !!type;
  if (!isValid) {
    console.error(`Invalid id: ${id}`);
  }

  return isValid;
}

export function normalize(id)
{
  if (id.startsWith('PMC:'))
  {
    return id.replace(':', '');
  }

  return id;
}

export function idToTypeAndUrl(id)
{
  function stripTag(id)
  {
    const strippedId = id.split(':');
    if (strippedId.length > 1)
    {
      return strippedId[1];
    }

    return false;
  }

  function taggedIdToUrl(id, url)
  {
    const strippedId = stripTag(id);
    if (!!strippedId)
    {
      return `${url}/${strippedId}`;
    }

    return false;
  }

  function pmidToUrl(id)
  {
    return taggedIdToUrl(id, 'https://pubmed.ncbi.nlm.nih.gov');
  }

  function pmcidToUrl(id)
  {
    return `https://www.ncbi.nlm.nih.gov/pmc/${id}`;
  }

  function nctidToUrl(id)
  {
    return `https://clinicaltrials.gov/ct2/show/${id}`;
  }

  function doiidToUrl(id)
  {
    return taggedIdToUrl(id, 'https://www.doi.org');
  }

  function hasTag(id, tag)
  {
    return id.startsWith(tag);
  }

  if (hasTag(id, 'PMID'))
  {
    return ['PMID', pmidToUrl(id)];
  }
  else if (hasTag(id, 'PMC'))
  {
    return ['PMC', pmcidToUrl(id)];
  }
  else if (hasTag(id, 'NCT'))
  {
    return ['NCT', nctidToUrl(id)];
  }
  else if (hasTag(id, 'clinicaltrialsNCT'))
  {
    return ['NCT', nctidToUrl(id.split('clinicaltrials')[1])];
  }
  else if (hasTag(id, 'DOI'))
  {
    return ['DOI', doiidToUrl(id)];
  }
  else
  {
    return [false, false];
  }
}
