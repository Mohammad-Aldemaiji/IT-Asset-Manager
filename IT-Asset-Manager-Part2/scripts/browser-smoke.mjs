import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// PLAYWRIGHT_MODULE allows the authoring environment to use its bundled runtime.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:8080';
const output = path.resolve(process.env.SMOKE_OUTPUT || 'test-results');
await fs.mkdir(output, { recursive:true });
for (let attempt=0; ; attempt++) {
  try { if ((await fetch(base+'/api/assets?size=1')).ok) break; } catch { /* Wait for Spring startup. */ }
  if (attempt >= 59) throw new Error('Server did not become ready within 30 seconds: '+base);
  await new Promise(resolve => setTimeout(resolve,500));
}
const browser = await chromium.launch({ headless:true, ...(process.env.BROWSER_CHANNEL ? {channel:process.env.BROWSER_CHANNEL} : {}) });
const page = await browser.newPage({ viewport:{width:1440,height:1000} });
const errors=[];
page.on('pageerror',error => errors.push(error.message));
const steps=[];
let createdId;
try {
  await page.goto(base + '/assets');
  await page.getByRole('table').waitFor();
  assert.equal(await page.locator('tbody tr').count(),5);
  await page.getByText('Page 1 of 2',{exact:true}).waitFor();
  await page.screenshot({path:path.join(output,'list.png'),fullPage:true});
  await page.getByRole('button',{name:'Next',exact:true}).click();
  await page.getByText('Page 2 of 2',{exact:true}).waitFor();
  steps.push('Server pagination through real React and Spring');

  await page.getByLabel('Search',{exact:true}).fill('apple');
  await page.getByText('Page 1 of 1',{exact:true}).waitFor();
  assert.equal(await page.locator('tbody tr').count(),2);
  steps.push('Filtering resets page and searches the complete dataset');

  await page.goto(base+'/assets/new');
  await page.getByRole('button',{name:'Add asset',exact:true}).click();
  await page.getByRole('alert').waitFor();
  await page.screenshot({path:path.join(output,'form-errors.png'),fullPage:true});
  await page.getByLabel('Asset name',{exact:false}).fill('Browser Demo Laptop');
  await page.getByLabel('Category',{exact:false}).selectOption('Laptop');
  await page.getByLabel('Brand',{exact:false}).fill('Dell');
  await page.getByLabel('Serial number',{exact:false}).fill('BROWSER-'+Date.now());
  await page.getByLabel('Department',{exact:false}).selectOption('IT');
  await page.getByLabel('Purchase date',{exact:false}).fill('2025-01-15');
  await page.getByLabel('Price (SAR)',{exact:false}).fill('3500');
  await page.getByRole('button',{name:'Add asset',exact:true}).click();
  await page.getByRole('heading',{name:'Browser Demo Laptop',exact:true}).waitFor();
  createdId=new URL(page.url()).pathname.split('/').pop();
  assert.match(createdId,/^AST-\d{4,}$/);
  steps.push('Client validation and create with server-generated ID');
  await page.reload();
  await page.getByRole('heading',{name:'Browser Demo Laptop',exact:true}).waitFor();
  steps.push('New data survives browser refresh');

  await page.getByRole('link',{name:'Edit',exact:true}).click();
  await page.getByLabel('Asset name',{exact:false}).fill('Browser Updated Laptop');
  await page.getByRole('button',{name:'Save changes',exact:true}).click();
  await page.getByRole('heading',{name:'Browser Updated Laptop',exact:true}).waitFor();
  steps.push('Update and reload details from the API');
  await page.goto(base+'/assets/AST-0004');
  await page.getByRole('heading',{name:'Main File Server',exact:true}).waitFor();
  await page.screenshot({path:path.join(output,'details.png'),fullPage:true});
  await page.goto(base+'/assets/AST-9999');
  await page.getByRole('heading',{name:'Asset not found',exact:true}).waitFor();
  steps.push('Direct detail routes and missing ID');

  await page.goto(base+'/about');
  await page.getByText('Mohammad Aldemaiji',{exact:true}).waitFor();
  for(const [name,id] of [['Mohammad Aldemaiji','222110184'],['Abdulmalik Mohamede','221211415'],['Abdulrahman Makhanik','222110452'],['Ibrahim Aldayhani','222111329']]) {
    assert.equal(await page.getByRole('row').filter({hasText:name}).getByText(id,{exact:true}).count(),1);
  }
  await page.screenshot({path:path.join(output,'about.png'),fullPage:true});
  steps.push('Four names match their supplied student IDs');

  await page.goto(base+'/');
  await page.getByRole('region',{name:'Summary'}).waitFor();
  await page.getByText('11',{exact:true}).waitFor();
  await page.screenshot({path:path.join(output,'dashboard.png'),fullPage:true});
  steps.push('Dashboard counts include assets outside the first page');

  await page.goto(base+'/assets/'+createdId);
  await page.getByRole('heading',{name:'Browser Updated Laptop',exact:true}).waitFor();
  await page.getByRole('button',{name:'Delete',exact:true}).click();
  await page.screenshot({path:path.join(output,'confirm.png'),fullPage:true});
  await page.getByRole('dialog').getByRole('button',{name:'Delete',exact:true}).click();
  await page.getByRole('heading',{name:'Assets',exact:true}).waitFor();
  await page.getByRole('table').waitFor();
  steps.push('Confirmed delete returns to the refreshed list');
  createdId=null;
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:path.join(output,'mobile-list.png'),fullPage:true});
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),true);
  steps.push('Mobile layout fits a 390-pixel viewport');
  assert.deepEqual(errors,[]);
  await fs.writeFile(path.join(output,'browser-results.json'),JSON.stringify({passed:steps.length,steps,pageErrors:errors},null,2));
  console.log(JSON.stringify({passed:steps.length,steps,pageErrors:errors},null,2));
} finally {
  if(createdId) await fetch(base+'/api/assets/'+createdId,{method:'DELETE'}).catch(()=>{});
  await browser.close();
}
