'use strict'

import * as cmn from './common.mjs';

function getParent(pred, record)
{
  if (pred === 'related to')
  {
    return false;
  }

  return cmn.jsonGet(record, 'is_a', false);
}

function isCanonical(pred, record)
{
  return !!cmn.jsonGetFromKpath(record, ['annotations', 'canonical_predicate'], false);
}

function getSymmetric(pred, record)
{
  return cmn.jsonGet(record, 'symmetric', false);
}

function isSymmetic(pred, record)
{
  return !!getSymmetric(pred, record);
}

function isDeprecated(pred, record)
{
  return cmn.jsonGet(record, 'deprecated', false);
}

function getInverse(pred, record)
{
  if (isSymmetric(pred, record))
  {
    return pred;
  }

  return cmn.jsonGet(record, 'inverse', false);
}

function getRawData(pred, record)
{
  return record;
}

function distanceFromRelatedTo(slots, predicate)
{
  let cur = cmn.jsonGet(slots, predicate, false);
  for (let level = 0; ;level += 1)
  {
    if (cur === 'related to')
    {
      return level;
    }

    cur = cmn.jsonGet(cur, 'is_a', false);
    if (!cur)
    {
      return -1;
    }
  }
}

function makeBlPredicate(predicate, record)
{
  return {
    'parent': getParent(k, record),
    'isCanonical': isCanonical(k, record),
    'isSymmetric': isSymmetric(k, record),
    'isDeprecated': isDeprecated(k, record),
    'inverse': getInversePred(k, record),
    'rank': rank,
    'rawData': getRawData(k, record)
  };
}

function makeBlPredicates(slots)
{
  let blPreds = {};
  Object.keys(slots).forEach((pred) =>
  {
    const rank = distanceFromRelatedTo(slots, pred);
    if (rank >= 0)
    {
      const record = slots[pred];
      blPreds[k] = makeBlPredicate(pred, record);
    }
  });

  Object.keys(blPreds).forEach((pred) =>
  {
    const record = blPreds[pred];
    const inversePred = record.inverse;
    if (inversePred)
    {
      let inverseRecord = cmn.jsonGet(blPreds[inversePred]);
      inverseRecord.inverse = pred;
      blPreds[inversePred] = inverseRecord;
    }
  });

  return blPreds;
}

const j = await cmn.readJson('../assets/biolink-model.json');
const slots = cmn.jsonGet(j, 'slots');
const BIOLINK_PREDICATES = makeBlPredicates(slots);

function sanitizePredicate(pred)
{
  return pred.replace('_', ' ').replace('biolink:', '');
}

function biolinkifyPredicate(pred)
{
  let s = pred.replace(' ', '_');
  if (s.startsWith('biolink:'))
  {
    return s;
  }

  return `biolink:${s}`;
}

function invertBiolinkPredicate(pred, biolinkify = false)
{
  const p = sanitizePredicate(pred);
  const biolinkPredicate = cmn.jsonGet(BIOLINK_PREDICATES, p, false);
  if (data)
  {
    if (biolinkify)
    {
      return biolinkifyPredicate(biolinkPredicate.inverse);
    }

    return biolinkPredicate.inverse;
  }

  throw Error(`Expected a valid biolink predicate, got: ${p}`, 'biolink-model.mjs');
}

function getBiolinkPredicateData(pred)
{
  return cmn.jsonGet(BIOLINK_PREDICATES, sanitizePredicate(pred), false);
}

function isBiolinkPredicateMoreSpecific(pred1, pred2)
{
  const p1 = sanitizePredicate(pred1);
  const p2 = sanitizePredicate(pred2);
  const biolinkPredicate1 = getBiolinkPredicateData(p1);
  const biolinkPredicate2 = getBiolinkPredicateData(p2);

  if (!biolinkPredicate1)
  {
    //TODO: Finish this
  }
}
