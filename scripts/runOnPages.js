$(document).ready(function () {

    var update = function () {
        console.log('run on pages running...');

        var imgs = $('img');
        imgs.each(function (index) {
            if ($(this).parent('span').hasClass('image-saver-pic'))
                return;
            if ($(this).height() > 100 && $(this).width() > 100) {
                $(this).wrap('<span class="image-saver-pic">');
                $(this).after('<span class="image-saver-image-icon image-saver-save-button"><a>' +
                    '<img alt="Save Image" src="http://icons.iconarchive.com/icons/deleket/soft-scraps/256/Save-icon.png"/>' +
                    '</a></span>');
                $(this).after('<span class="image-saver-image-icon image-saver-download-button"><a>' +
                    '<img alt="Download Image" src="https://cdn1.iconfinder.com/data/icons/CrystalClear/48x48/apps/ark2.png"/>' +
                    '</a></span>');
                $(this).parent('.image-saver-pic').css('max-height', $(this).height());
                $(this).parent('.image-saver-pic').css('max-width', $(this).width());
                $(this).parent('.image-saver-pic').css('min-height', $(this).height());
                $(this).parent('.image-saver-pic').css('min-width', $(this).width());
                $(this).parent('.image-saver-pic').css('display', 'block');

                var wrapperSpan = $(this).parent('.image-saver-pic');
                wrapperSpan.css('z-index', '9999999');

                var buttonSpans = $(this).siblings('span');
                buttonSpans.css('visibility', 'hidden'); // TODO figure this out
                buttonSpans.css('height', '25px');
                buttonSpans.css('width', '25px');
                buttonSpans.css('position', 'relative');
                buttonSpans.css('bottom', '40px');
                buttonSpans.css('left', ($(this).width() - 70) + 'px');
                buttonSpans.css('opacity', '0.5');
                buttonSpans.css('margin', '2px');
                buttonSpans.css('z-index', '9999999');
                buttonSpans.css('display', 'inline');

                var btnA = buttonSpans.children('a');
                btnA.css('height', '25px');
                btnA.css('width', '25px');
                btnA.css('min-height', '25px');
                btnA.css('min-width', '25px');
                btnA.css('max-height', '25px');
                btnA.css('max-width', '25px');
                btnA.css('display', 'inline');
                btnA.css('cursor', 'pointer');

                var btnImgs = buttonSpans.children('a').children('img');
                btnImgs.css('height', '25px');
                btnImgs.css('width', '25px');
                btnImgs.css('min-height', '25px');
                btnImgs.css('min-width', '25px');
                btnImgs.css('max-height', '25px');
                btnImgs.css('max-width', '25px');
                btnImgs.css('display', 'inline');

                btnA.click(function (event) {
                    event.preventDefault();
                });
            }
        });

        var wrapperSpans = $('span.image-saver-pic');
        var icons = $('span.image-saver-image-icon');

        wrapperSpans.mouseenter(function () {
            $(this).children('.image-saver-image-icon').css('visibility', 'visible');
        });
        wrapperSpans.mouseleave(function () {
            $(this).children('.image-saver-image-icon').css('visibility', 'hidden');
        });

        icons.mouseenter(function () {
            $(this).css('opacity', '1.0');
        });
        icons.mouseleave(function () {
            $(this).css('opacity', '0.5');
        });

        $('.image-saver-save-button a').click(function () {
            var $img = $(this).parent().siblings('img');
            var imgSrc = $img.prop('src');
            console.log('src: ? ' + imgSrc);
            var alt = $img.attr('alt');
            var saveDate = new Date().toISOString();
            alt = alt ? alt : new Date().toLocaleTimeString().replace(":", ".").replace(":", ".");


            // TODO figure out how to ask what folder to put this in and what to name the file
            // use modal

            chrome.storage.local.get('root', function (val) {
                val.root.folderContents.push({
                    name: alt,
                    imgUrl: imgSrc,
                    saveDate: saveDate,
                    isFolder: false
                });
                chrome.storage.local.set({'root': val.root});
            });
        });

        $('.image-saver-download-button a').click(function () {
            console.log('attempting to download...');

            var $img = $(this).parent().siblings('img');
            var imgUrl = $img.prop('src');
            var alt = $img.attr('alt');
            alt = alt ? alt : new Date().toLocaleTimeString().replace(":", ".").replace(":", ".");

            var lastPeriod = imgUrl.lastIndexOf(".");
            var name = alt.replace(":", ".").replace(":", ".");
            var extension = imgUrl.substr(lastPeriod, imgUrl.length - lastPeriod);

            console.log(imgUrl);

            var xhr = new XMLHttpRequest();
            xhr.open('GET', imgUrl, true);
            xhr.responseType = 'arraybuffer';

            xhr.onload = function (e) {
                if (this.status == 200) {
                    var saveas = document.createElement("iframe");
                    saveas.style.display = "none";
                    saveas.name = name + extension;

                    var zip = new JSZip();
                    zip.file(name + extension, xhr.response);

                    var blob = zip.generate({ type: "blob"});

                    if (!!window.createObjectURL == false) {
                        saveas.src = window.webkitURL.createObjectURL(blob);
                    }
                    else {
                        saveas.src = window.createObjectURL(blob);
                    }

                    document.body.appendChild(saveas);
                }
            };

            xhr.send();
        });
    };

    update();
});



