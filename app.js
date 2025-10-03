// app.js dosyasının en üstüne ekleyin:
// NPM ile kurduğunuz SDK'yı import ediyoruz.
import { miniApp } from '@farcaster/miniapp-sdk'; 

console.log("App.js yüklendi. Mini App SDK import edildi.");

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('posterCanvas');
    const ctx = canvas.getContext('2d');
    const textInput = document.getElementById('posterText');
    const bgColorInput = document.getElementById('bgColor');

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    // Canvas'ı güncelleme ve çizim mantığı
    window.updateCanvas = function() {
        const text = textInput.value || "Farcaster Poster Maker";
        const bgColor = bgColorInput.value;

        // Arka planı çiz
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        // Metin ayarları
        ctx.fillStyle = getContrastColor(bgColor);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 48px Arial';

        wrapText(ctx, text, WIDTH / 2, HEIGHT / 2, WIDTH - 40, 60);
    };

    // Arka plan rengine göre metin rengini siyah veya beyaz yapma (Kontrast)
    function getContrastColor(hexcolor){
        const r = parseInt(hexcolor.slice(1, 3), 16);
        const g = parseInt(hexcolor.slice(3, 5), 16);
        const b = parseInt(hexcolor.slice(5, 7), 16);
        const y = (0.299 * r) + (0.587 * g) + (0.114 * b);
        return (y > 150) ? '#000000' : '#FFFFFF';
    }

    // Uzun metinleri birden fazla satıra bölmek için yardımcı fonksiyon
    function wrapText(context, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        const lines = [];

        // ... (Kalan wrapText fonksiyon içeriği, önceki mesajdan kopyalanabilir)
        for(let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = context.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                lines.push(line);
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);
        
        let currentY = y - ((lines.length - 1) * lineHeight / 2);

        for (let i = 0; i < lines.length; i++) {
            context.fillText(lines[i].trim(), x, currentY);
            currentY += lineHeight;
        }
    }


    // Farcaster'da Paylaş Fonksiyonu
    window.sharePoster = async function() {
        if (!miniApp) return alert("Farcaster SDK yüklenemedi. Lütfen Base Preview'da deneyin.");

        const imageDataUrl = canvas.toDataURL("image/png");

        try {
            // SDK'yı import ettiğimiz 'miniApp' nesnesi üzerinden kullanıyoruz
            await miniApp.composeCast({
                text: "Yeni posterim! 🎨 Farcaster Mini App'te oluşturdum.",
                embeds: [imageDataUrl] 
            });
        } catch (err) {
            console.error("Farcaster paylaşım hatası:", err);
            alert("Paylaşım başarısız oldu. Konsolu kontrol edin.");
        }
    };

    // İlk yüklemede ve giriş değiştiğinde güncelleme
    textInput.addEventListener('input', updateCanvas);
    bgColorInput.addEventListener('change', updateCanvas);
    updateCanvas();
    
    // Uygulama yüklendiğinde Farcaster'a hazır sinyali gönder
    if (miniApp) {
        miniApp.ready(); 
        console.log("miniApp.ready() başarıyla çağrıldı ✅");
    } else {
        console.error("Mini App SDK bulunamadı (Import hatası)");
    }
});