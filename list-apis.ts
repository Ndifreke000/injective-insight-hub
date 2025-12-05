
import * as sdk from '@injectivelabs/sdk-ts';

const apis = Object.keys(sdk).filter(k => k.endsWith('Api'));
console.log('APIs:', apis);
