import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AppRoutes } from '../src/App';
import { AssetProvider } from '../src/context/AssetProvider';
import initialAssets from '../src/data/initialAssets';
import { filterAssets } from '../src/utils/filterAssets';
import { computeStats } from '../src/utils/stats';

/** HTTP fake used only in tests. Production always uses the Spring server. */
export function installApi(assets = initialAssets) {
  let records = structuredClone(assets);
  let nextId = Math.max(0, ...records.map(a => Number(a.id.slice(4)))) + 1;
  const server = { failNext: null, calls: [] };
  const reply = (body, status=200) => new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { 'Content-Type':'application/json' } });
  vi.stubGlobal('fetch', vi.fn(async (url, options = {}) => {
    const method = options.method || 'GET';
    server.calls.push({ url, method, options });
    if (server.failNext) { const error=server.failNext; server.failNext=null; if (error === 'network') throw new Error('offline'); return reply(error.body,error.status); }
    const parsed = new URL(url, 'http://localhost');
    const id = decodeURIComponent(parsed.pathname.split('/').pop());
    if (method === 'GET' && id === 'stats') return reply(computeStats(records));
    if (method === 'GET' && id === 'assets') {
      const p=parsed.searchParams;
      const [sortBy,sortDir]=(p.get('sort') || 'id,asc').split(',');
      const filtered=filterAssets(records,{ query:p.get('q') || '', category:p.get('category') || '', status:p.get('status') || '',sortBy,sortDir });
      const page=Number(p.get('page') || 0), size=Number(p.get('size') || 5);
      return reply({ content:filtered.slice(page*size,(page+1)*size),page,size,totalElements:filtered.length,totalPages:Math.ceil(filtered.length/size) });
    }
    if (method === 'POST' || method === 'PUT') {
      const values=JSON.parse(options.body);
      if (records.some(a => a.id !== id && a.serialNumber === values.serialNumber)) return reply({message:'Duplicate',errors:{serialNumber:'Another asset already has this serial number.'}},409);
      if (method === 'PUT' && !records.some(a => a.id === id)) return reply({message:'Not found'},404);
      const asset={...values,id:method === 'POST' ? 'AST-' + String(nextId++).padStart(4,'0') : id};
      records=method === 'POST' ? [...records,asset] : records.map(a => a.id === id ? asset : a);
      return reply(asset,method === 'POST' ? 201 : 200);
    }
    const asset=records.find(a => a.id === id);
    if (!asset) return reply({message:'Asset was not found.'},404);
    if (method === 'DELETE') { records=records.filter(a => a.id !== id); return reply(null,204); }
    return reply(asset);
  }));
  return server;
}

export function renderApp(route = '/', assets = initialAssets) {
  const server=installApi(assets);
  const user=userEvent.setup();
  const utils=render(<AssetProvider><MemoryRouter initialEntries={[route]}><AppRoutes /></MemoryRouter></AssetProvider>);
  return { user,server,...utils };
}

export function makeAsset(overrides = {}) {
  return { name:'Test Laptop',category:'Laptop',brand:'Dell',model:'Latitude 5440',serialNumber:'TEST-0001',status:'Available',assignedTo:'',department:'IT',location:'Lab',purchaseDate:'2025-01-15',purchasePrice:3500,warrantyExpiry:'2027-01-15',notes:'',...overrides };
}
