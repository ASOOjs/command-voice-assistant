const recognition = new webkitSpeechRecognition() || speechRecognition();
recognition.lang = 'tr-TR'; // Türkçe dilini belirle

let isRecognitionStarted = false;

recognition.onstart = () => {
    speak("Sizi dinliyorum.");
    console.log('Ses tanıma başladı. Şimdi konuşabilirsiniz.');
    // Dinleme işlemi yapılırken göstergeyi görünür hale getiriyor.
    showListeningIndicator(true);
    // Ses Tanıma işlemi başlatıldığı belirtiliyor.
    isRecognitionStarted = true;
};

recognition.onend = () => {
    showListeningIndicator(false);
    isRecognitionStarted = false;
};

recognition.onresult = (event) => {
    // event.results => Ses tanıma olayından sonra ki sonuçkları içeren nesne
    // [0][0] ise oluşan ilk sonucun içinde ki ilk alternatif sonucun belirtildiği seçilir.
    const transcript = event.results[0][0].transcript;
    console.log('Söylediğiniz: ', transcript);

    // "komut ekle" dediğinde
    // toLoweCase() => Büyük, küçük ayrımı gözetmeksizin belirtilen stringi alır.
    if (transcript.toLowerCase().includes('komut ekle')) {
        const newCommand = prompt('Yeni komut adını girin:');
        const newResult = prompt('Yeni komut tepkisini girin:');

        // Yeni komutu JSON dosyasına ekleyin
        fetch('../type.json')
        // Javascript nesnesine dönüştürülüp promise olarak döndürülüyor.
        // promise => asenkron işlemleri yönetmek için kullanılan nesnedir.
            .then(response => response.json())
            .then(commands => {
                // commands içine komut adı ve tepkisi belirtilicek şekilde puşlanıyor.
                commands.push({ commandName: newCommand, result: newResult });

                // JSON dosyasını güncelle 
                // "http://localhost:3000/types urlsini fetchleyerek POST gönderiliyor."
                return fetch('http://localhost:3000/types', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    // Bu dönüşüm JSON verisinin bir dize haline getirilmesini sağlar.
                    body: JSON.stringify(commands)
                });
            })
            .then(() => {
                speak(`${newCommand} isimli komut, ${newResult} tepkisi verilicek şekilde ayarlandı ve kayıt edildi. `);
            })
            .catch(error => console.error('Type.json dosyasını güncelleme hatası:', error));
    } else {
        // Diğer komutları kontrol et
        fetch('../type.json') // type.json dosyasının doğru yolunu belirtin
            .then(response => response.json())
            .then(commands => {
                // command.commandName verisinin olup olmadığını kontrol edip, büyük, küçük harf ayrımı yapılmıyor.
                const matchingCommand = commands.find(command => transcript.toLowerCase().includes(command.commandName.toLowerCase()));
                if (!matchingCommand) return speak("Maalesef belirtilen komut bulunamadı.")

                if (matchingCommand) {
                    speak(matchingCommand.result);
                    // isRecognitionStarted eğer durmuş veya false olarak ayarlanmışsa işlem tekrar başlatılıyor.
                    if (!isRecognitionStarted) {
                        recognition.start();
                    }
                }
            })
            .catch(error => console.error('Type.json dosyasını okuma hatası:', error));
    }
};
// Burdaki fonksiyon (Web Speech API parçası olan speechSynthesis) nesnesini kullanarak metni konuşturma yeteneği sağlar.
function speak(message) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(message);
    synth.speak(utterance);
}

function showListeningIndicator(show) {
    const indicator = document.getElementById('listeningIndicator');
    if (show) {
        indicator.style.display = 'inline-block';
    } else {
        indicator.style.display = 'none';
    }
}
// startBtn idsine sahip butona tıklandığı zaman fonksiyon çalıştırılıyor.
document.getElementById('startBtn').addEventListener('click', () => {
    recognition.start();
});