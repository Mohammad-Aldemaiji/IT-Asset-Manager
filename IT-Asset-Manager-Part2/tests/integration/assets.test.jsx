import { screen, within, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import initialAssets from '../../src/data/initialAssets';
import { renderApp } from '../testUtils';

const rows = () => within(screen.getByRole('table')).getAllByRole('row').slice(1);
const loaded = () => screen.findByRole('table');
async function fill(user,serial='QA-12345') {
  await user.type(screen.getByLabelText(/Asset name/),'QA Laptop');
  await user.selectOptions(screen.getByLabelText(/Category/),'Laptop');
  await user.type(screen.getByLabelText(/Brand/),'Lenovo');
  await user.type(screen.getByLabelText(/Serial number/),serial);
  await user.selectOptions(screen.getByLabelText(/Department/),'IT');
  await user.type(screen.getByLabelText(/Purchase date/),'2025-05-01');
  await user.type(screen.getByLabelText(/Price/),'4200');
}
describe('server reads and pagination', () => {
  it('loads only a page and requests the next page from the API',async () => {
    const {user,server}=renderApp('/assets'); await loaded();
    expect(rows()).toHaveLength(5); expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button',{name:'Previous'})).toBeDisabled();
    await user.click(screen.getByRole('button',{name:'Next'})); await loaded();
    expect(screen.getByText('Sales Manager Phone')).toBeInTheDocument(); expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button',{name:'Next'})).toBeDisabled();
    expect(server.calls.some(c => c.url.includes('page=1'))).toBe(true);
  });
  it('resets page when filters change and searches across the full dataset',async () => {
    const {user}=renderApp('/assets?page=1'); await loaded();
    await user.type(screen.getByLabelText('Search'),'apple'); await loaded();
    await waitFor(() => expect(rows()).toHaveLength(2));
    expect(screen.getByText('Sales Manager Phone')).toBeInTheDocument(); expect(screen.getByText('Marketing MacBook')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
  });
  it('passes category status and sorting to the server',async () => {
    const {user,server}=renderApp('/assets'); await loaded();
    await user.selectOptions(screen.getByLabelText(/Category/),'Laptop'); await loaded();
    expect(rows()).toHaveLength(3);
    await user.selectOptions(screen.getByLabelText('Status'),'Retired'); await loaded(); expect(rows()).toHaveLength(1);
    await user.selectOptions(screen.getByLabelText('Sort by'),'purchasePrice'); await loaded();
    await user.click(screen.getByRole('button',{name:/switch to descending/})); await loaded();
    expect(server.calls.at(-1).url).toContain('sort=purchasePrice%2Cdesc');
  });
  it('supports URL filters and page size changes',async () => {
    const {user}=renderApp('/assets?status=Available'); await loaded(); expect(rows()).toHaveLength(2);
    await user.click(screen.getByRole('button',{name:'Clear filters'})); await loaded();
    await user.selectOptions(screen.getByLabelText('Assets per page'),'10'); await loaded(); expect(rows()).toHaveLength(10);
  });
  it('shows an empty state and a no-matches state',async () => {
    const {user}=renderApp('/assets',[]);
    expect(await screen.findByText('There are no assets yet.')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Search'),'none');
    expect(await screen.findByText('No assets match your search.')).toBeInTheDocument();
  });
  it('loads a detail URL directly from the API',async () => {
    const {server}=renderApp('/assets/AST-0004');
    expect(await screen.findByRole('heading',{name:'Main File Server'})).toBeInTheDocument();
    expect(screen.getByText('DL-PE-R750-0091')).toBeInTheDocument();
    expect(server.calls[0].url).toBe('/api/assets/AST-0004');
  });
  it('finds by exact ID using the lookup form',async () => {
    const {user}=renderApp('/assets'); await loaded();
    await user.type(screen.getByLabelText('Find by exact asset ID'),'ast-0008');
    await user.click(screen.getByRole('button',{name:'Find asset'}));
    expect(await screen.findByRole('heading',{name:'Core Network Switch'})).toBeInTheDocument();
  });
  it('shows not found separately from a network error',async () => {
    renderApp('/assets/AST-9999'); expect(await screen.findByRole('heading',{name:'Asset not found'})).toBeInTheDocument();
  });
  it('allows retry after the backend is unavailable',async () => {
    const {user,server}=renderApp('/assets'); await loaded(); server.failNext='network';
    await user.click(screen.getByRole('button',{name:'Next'}));
    expect(await screen.findByRole('alert')).toHaveTextContent('Cannot reach the server.');
    await user.click(screen.getByRole('button',{name:'Try again'})); await loaded(); expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
  });
  it('ignores stale replies after search changes',async () => {
    const {user}=renderApp('/assets'); await loaded();
    const realFetch=global.fetch; let resolveOld;
    global.fetch=vi.fn((url,options) => url.includes('q=x&') ? new Promise(resolve => {resolveOld=resolve;}) : realFetch(url,options));
    await user.type(screen.getByLabelText('Search'),'x');
    await user.clear(screen.getByLabelText('Search')); await loaded();
    resolveOld(new Response(JSON.stringify({content:[],page:0,size:5,totalElements:0,totalPages:0}),{status:200}));
    await waitFor(() => expect(rows()).toHaveLength(5));
  });
});
describe('API writes', () => {
  it('adds an asset and navigates only after server success',async () => {
    const {user,server}=renderApp('/assets/new'); await fill(user);
    await user.click(screen.getByRole('button',{name:'Add asset'}));
    expect(await screen.findByRole('heading',{name:'QA Laptop'})).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Asset AST-0011 was added.');
    const post=server.calls.find(c => c.method==='POST'); expect(JSON.parse(post.options.body).warrantyExpiry).toBeNull();
    expect(JSON.parse(post.options.body)).not.toHaveProperty('id');
  });
  it('validates before posting and focuses the first invalid field',async () => {
    const {user,server}=renderApp('/assets/new'); await user.click(screen.getByRole('button',{name:'Add asset'}));
    expect(screen.getByRole('alert')).toHaveTextContent('Please fix'); expect(screen.getByLabelText(/Asset name/)).toHaveFocus();
    expect(server.calls).toHaveLength(0);
  });
  it('displays a duplicate serial returned by the server',async () => {
    const {user}=renderApp('/assets/new'); await fill(user,'DL-XPS-88231'); await user.click(screen.getByRole('button',{name:'Add asset'}));
    expect(await screen.findByText('Another asset already has this serial number.')).toBeInTheDocument();
  });
  it('keeps form values when saving fails',async () => {
    const {user,server}=renderApp('/assets/new'); await fill(user); server.failNext='network';
    await user.click(screen.getByRole('button',{name:'Add asset'})); expect(await screen.findByRole('alert')).toHaveTextContent('Cannot reach');
    expect(screen.getByLabelText(/Asset name/)).toHaveValue('QA Laptop'); expect(screen.getByRole('button',{name:'Add asset'})).toBeEnabled();
  });
  it('prevents repeated submissions while a write is pending',async () => {
    const {user}=renderApp('/assets/new'); await fill(user); let resolve;
    global.fetch=vi.fn(() => new Promise(done => { resolve=done; }));
    await user.click(screen.getByRole('button',{name:'Add asset'}));
    expect(screen.getByRole('button',{name:'Saving…'})).toBeDisabled(); expect(global.fetch).toHaveBeenCalledTimes(1);
    resolve(new Response(JSON.stringify({message:'Retry later'}),{status:503}));
    expect(await screen.findByRole('alert')).toHaveTextContent('Retry later');
  });
  it('updates a directly loaded asset and excludes the id from the write DTO',async () => {
    const {user,server}=renderApp('/assets/AST-0003/edit'); const name=await screen.findByLabelText(/Asset name/);
    await user.clear(name); await user.type(name,'Updated Monitor'); await user.click(screen.getByRole('button',{name:'Save changes'}));
    expect(await screen.findByRole('heading',{name:'Updated Monitor'})).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Changes saved.');
    const put=server.calls.find(c=>c.method==='PUT'); expect(JSON.parse(put.options.body)).not.toHaveProperty('id');
  });
  it('cancels deletion without issuing DELETE',async () => {
    const {user,server}=renderApp('/assets'); await loaded(); await user.click(screen.getByRole('button',{name:'Delete Main File Server'}));
    await user.click(within(screen.getByRole('dialog')).getByRole('button',{name:'Cancel'})); expect(server.calls.some(c=>c.method==='DELETE')).toBe(false);
  });
  it('retains an asset and confirmation when DELETE fails',async () => {
    const {user,server}=renderApp('/assets'); await loaded(); await user.click(screen.getByRole('button',{name:'Delete Main File Server'}));
    server.failNext='network'; await user.click(within(screen.getByRole('dialog')).getByRole('button',{name:'Delete'}));
    expect(await screen.findByRole('alert')).toHaveTextContent('Cannot reach'); expect(screen.getByText('Main File Server')).toBeInTheDocument();
  });
  it('deletes the final row of a page and returns to the previous page',async () => {
    const {user}=renderApp('/assets?page=1',initialAssets.slice(0,6)); await loaded();
    await user.click(screen.getByRole('button',{name:'Delete Sales Manager Phone'}));
    await user.click(within(screen.getByRole('dialog')).getByRole('button',{name:'Delete'}));
    expect(await screen.findByText('Page 1 of 1')).toBeInTheDocument(); await loaded(); expect(rows()).toHaveLength(5);
  });
  it('deletes from details and refreshes the list',async () => {
    const {user}=renderApp('/assets/AST-0005'); await screen.findByRole('heading',{name:'Office Printer - 2nd Floor'});
    await user.click(screen.getByRole('button',{name:'Delete'})); await user.click(within(screen.getByRole('dialog')).getByRole('button',{name:'Delete'}));
    await loaded(); expect(screen.queryByText('Office Printer - 2nd Floor')).not.toBeInTheDocument();
  });
});
describe('dashboard', () => {
  it('uses all-asset statistics rather than a page',async () => {
    const {server}=renderApp('/'); await screen.findByRole('region',{name:'Summary'});
    expect(screen.getByText('Total assets').nextSibling).toHaveTextContent('10'); expect(server.calls[0].url).toBe('/api/assets/stats');
  });
  it('refreshes totals after a successful delete',async () => {
    const {user}=renderApp('/assets'); await loaded(); await user.click(screen.getByRole('button',{name:'Delete Main File Server'}));
    await user.click(within(screen.getByRole('dialog')).getByRole('button',{name:'Delete'})); await screen.findByText(/was deleted/); await loaded();
    await user.click(screen.getByRole('link',{name:'Dashboard'})); await screen.findByRole('region',{name:'Summary'});
    expect(screen.getByText('Total assets').nextSibling).toHaveTextContent('9');
  });
});
