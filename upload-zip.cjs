const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

(async () => {
    try {
        console.log('Reading ZIP...');
        const zipPath = path.join(__dirname, 'public', 'ArambhPrinterService.zip');
        const fileData = fs.readFileSync(zipPath);
        
        console.log(`Uploading ${fileData.length} bytes to Supabase Storage...`);
        const { data, error } = await supabase.storage
            .from('pos-printers')
            .upload('ArambhPrinterService.zip', fileData, {
                contentType: 'application/zip',
                upsert: true
            });
            
        if (error) {
            console.error('Upload Error:', error.message);
            process.exit(1);
        }
        
        const { data: { publicUrl } } = supabase.storage
            .from('pos-printers')
            .getPublicUrl('ArambhPrinterService.zip');
            
        console.log('--- UPLOAD SUCCESS ---');
        console.log(publicUrl);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
