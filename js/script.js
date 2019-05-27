(function () {
    'use strict';

    window.onload = () => {
        console.log('Application loaded !');

        const apiUrl = 'http://localhost:8000/api/v1/pictures';
        const pictureIconButton = document.getElementById('picture-icon-button');
        const explanation = document.getElementById('explaination');
        const confirmation = document.getElementById('confirmation');
        const cancel = document.getElementById('cancel');
        const validate = document.getElementById('validate');
        const loader = document.getElementById('loader');
        const images = document.getElementById('images');
        let resizedImageCanvas = null;

        initEventListeners();

        function initEventListeners() {

            cancel.addEventListener('click', () => {
                show(pictureIconButton);
                show(explanation);
                hide(confirmation);
                images.innerHTML = '';
            });

            validate.addEventListener('click', () => {
                // TODO: intercepter le retour des appels de l'API par ici
                // debugger;
                putCanvasInCache(`image-${new Date().getTime()}.jpg`, resizedImageCanvas);
            });

            pictureIconButton.addEventListener('click', () => clickPictureIconButton());
        }

        function clickPictureIconButton() {
            let input = document.createElement('input');
            input.setAttribute('id', 'image-input');
            input.setAttribute('class', 'hidden');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.click();
            input.addEventListener('change', () => {
                hide(pictureIconButton);
                previewFile(input);
                hide(explanation);
                show(confirmation)
            });
        }

        function previewFile(input) {
            let current_file = input.files[0];
            if (current_file.type.indexOf('image') === 0) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    let image = new Image();
                    image.src = event.target.result;
                    image.onload = function () {
                        const maxWidth = 200, maxHeight = 400;
                        let resizedDimentions = getResizedDimentions(image, maxWidth, maxHeight);
                        resizedImageCanvas = getResizedImageCanvas(this, resizedDimentions);
                        images.innerHTML += `<img src="${resizedImageCanvas.toDataURL(current_file.type)}" alt="">`;
                        // putCanvasInCache(`image-${new Date().getTime()}.jpg`, resizedImageCanvas);
                    }
                };
                reader.readAsDataURL(current_file);
            }
        }

        function getResizedImageCanvas(image, dimentions) {
            const resizedImageCanvas = document.createElement('canvas');
            resizedImageCanvas.width = dimentions.width;
            resizedImageCanvas.height = dimentions.height;
            resizedImageCanvas.getContext('2d').drawImage(image, 0, 0, dimentions.width, dimentions.height);
            return resizedImageCanvas;
        }

        function getResizedDimentions(image, maxWidth, maxHeight) {
            let resizedDimentions = {
                width: image.width,
                height: image.height
            };
            if (image.width >= image.height) {
                if (image.width > maxWidth) {
                    resizedDimentions.height *= maxWidth / image.width;
                    resizedDimentions.width = maxWidth;
                }
            } else {
                if (image.height > maxHeight) {
                    resizedDimentions.width *= maxHeight / image.height;
                    resizedDimentions.height = maxHeight;
                }
            }
            return resizedDimentions;
        }

        //TODO rename
        function putCanvasInCache(url, canvas) {
            canvas.toBlob((blob) => {
                callAPI(blob);
            }, 'image/jpeg');
        }

        function show(el) {
            el.classList.remove('hidden');
        }

        function hide(el) {
            el.classList.add('hidden');
        }

        function callAPI(blob) {
            show(loader);
            let formData = new FormData();
            formData.append('file', blob);

            fetch(apiUrl, {
                method: 'post',
                body: formData
            }).then(function(response) {
                // TODO: intégrer la réponse du back ici si il en a une...
                // debugger;
                hide(loader);
            });

        }

        function getPictures(datas) {
            hide(croppedImage);
            show(resultProducts);
            let resultTitle = document.createElement('h1');
            resultTitle.innerText = 'Résultats de la recherche';
            resultProducts.appendChild(resultTitle);

            datas.forEach((data) => {
                const ref = data[0];
                const formatRef = ref.slice(0, ref.indexOf('_'));
                const preffixRef = ref.slice(0, 2);
                const apiStyleUrl = `https://api.kiabi.com/v1/styles/${formatRef}/commercial_attributes?apikey=83c9d870-469e-11e7-98c3-c2b663306ca5`;
                axios.get(apiStyleUrl).then((style) => {
                    const link = style.data.colorAttributes[0].webSiteLinks[0].url;
                    const shortTitle = style.data.colorAttributes[0].shortTitle;
                    let pictureUrl = `https://cdn.kiabi.com/productpictures/${preffixRef}/${formatRef}/${ref}_PR1.jpg?apikey=MOKA`;

                    let newImg = document.createElement('img');
                    newImg.setAttribute('id', formatRef);
                    newImg.setAttribute('class', 'result-image');
                    newImg.setAttribute('alt', formatRef);
                    newImg.setAttribute('src', pictureUrl);

                    let card = document.createElement('div');
                    card.setAttribute('class', 'my-card');

                    let title = document.createElement('h2');
                    title.innerText = shortTitle;

                    let secondTitle = document.createElement('h4');
                    secondTitle.setAttribute('style', 'margin-top:0');
                    secondTitle.innerText = formatRef;

                    let indiceSimilarité = document.createElement('h3');
                    indiceSimilarité.innerText = `Indice: ${data[1].toFixed(3)}`;

                    let websiteLinkButton = document.createElement('button');
                    websiteLinkButton.setAttribute('class', 'mdc-button secondary-text-button mdc-button--raised');
                    websiteLinkButton.setAttribute('style', 'color: white; background-color: #3F50B2')
                    websiteLinkButton.addEventListener('click', () => window.open(link, '_system'));
                    websiteLinkButton.innerText = `Voir article`;

                    resultProducts.appendChild(card);
                    card.appendChild(newImg);
                    card.appendChild(title);
                    card.appendChild(secondTitle);
                    card.appendChild(websiteLinkButton);
                })
            });

        }

        function reload() {
            window.location.reload();
        }
    }
})();
