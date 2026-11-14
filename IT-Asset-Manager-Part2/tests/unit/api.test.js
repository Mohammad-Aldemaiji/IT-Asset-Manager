import {afterEach,describe,expect,it,vi} from 'vitest';
import {assetsApi} from '../../src/api/assets';
afterEach(() => vi.unstubAllGlobals());
describe('HTTP client', () => {
  it('encodes public IDs',async () => { vi.stubGlobal('fetch',vi.fn(async()=>new Response('{}'))); await assetsApi.get('AST/a b'); expect(fetch.mock.calls[0][0]).toBe('/api/assets/AST%2Fa%20b'); });
  it('handles unreadable server replies',async () => { vi.stubGlobal('fetch',vi.fn(async()=>new Response('broken',{status:502}))); await expect(assetsApi.stats()).rejects.toThrow('unreadable'); });
  it('preserves status and field errors',async () => { vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({message:'Invalid',errors:{name:'Required'}}),{status:400}))); await expect(assetsApi.create({})).rejects.toMatchObject({status:400,errors:{name:'Required'}}); });
  it('does not parse a 204 response',async () => { vi.stubGlobal('fetch',vi.fn(async()=>new Response(null,{status:204}))); await expect(assetsApi.delete('AST-0001')).resolves.toBeNull(); });
});
