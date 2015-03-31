jQuery.noConflict();

var imageSaverModule = angular.module('imageSaverModule', []);

imageSaverModule.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}
]);

console.log('common.js running...');

imageSaverModule.factory('imageService', function () {
    var module = {
        getSavedItems: function (callback) {
            try {
                chrome.storage.local.get('root', function (val) {
                    console.log('got value below');
                    console.log(val);
                    var clear = false;
                    if (!clear && val && val !== null && val.root && val.root !== null) {
                        imageSaverModule.addParentReferences(val.root);
                        console.log('Loading root from storage');
                        callback(val.root);
                    } else {
                        // no storage - add new
                        console.log('adding new array');
                        var rootObj = {
                            name: "root",
                            isFolder: true,
                            saveDate: new Date().toISOString(),
                            folderContents: []
                        };
                        module.setSavedItems(rootObj);
                        callback(rootObj);
                    }
                });
            } catch (ex) {
                console.log('loaded default values');
                var folder1sub1 = { name: 'ok photos', saveDate: 1, imgUrl: 'https://cdn1.iconfinder.com/data/icons/HYDROPRO/Folder-2.png', isFolder: true, folderContents: [
                    { name: 'lambo', saveDate: 502, imgUrl: 'http://d366vafdki9sdu.cloudfront.net/files/54/2945/pretty-office-icons-screenshots-4.png', isFolder: false, parent: folder1sub1 }
                ]};
                var folder1 = { name: 'cooler photos', saveDate: 100, imgUrl: 'https://cdn1.iconfinder.com/data/icons/HYDROPRO/Folder-2.png', isFolder: true, folderContents: [
                    { name: 'lambo', saveDate: 100, imgUrl: 'http://d194m38p9c1s7c.cloudfront.net/files/54/2945/pretty-office-icons-screenshots-9.png', isFolder: false, parent: folder1 },
                    { name: 'lambo', saveDate: 40, imgUrl: 'http://d194m38p9c1s7c.cloudfront.net/files/54/2945/pretty-office-icons-screenshots-9.png', isFolder: false, parent: folder1 },
                    folder1sub1
                ]};

                var folder2 = { name: 'folder2', saveDate: 50, imgUrl: 'https://cdn1.iconfinder.com/data/icons/HYDROPRO/Folder-2.png', isFolder: true, folderContents: [
                    { name: 'lambo', saveDate: 40, imgUrl: 'http://d194m38p9c1s7c.cloudfront.net/files/54/2945/pretty-office-icons-screenshots-9.png', isFolder: false, parent: folder2 }
                ]};

                var data = {name: "root", isFolder: true, folderContents: [
                    { name: 'abcd', saveDate: 201, imgUrl: "http://d366vafdki9sdu.cloudfront.net/files/54/2945/pretty-office-icons-screenshots-4.png", isFolder: false },
                    folder1,
                    folder2,
                    { name: 'folderx', saveDate: 50, imgUrl: 'https://cdn1.iconfinder.com/data/icons/HYDROPRO/Folder-2.png', isFolder: true, folderContents: [] },
                    { name: 'foldery', saveDate: 50, imgUrl: 'https://cdn1.iconfinder.com/data/icons/HYDROPRO/Folder-2.png', isFolder: true, folderContents: [] },
                    { name: 'folderz', saveDate: 50, imgUrl: 'https://cdn1.iconfinder.com/data/icons/HYDROPRO/Folder-2.png', isFolder: true, folderContents: [] },
                    { name: 'bcde', saveDate: 200, imgUrl: 'http://icons.iconarchive.com/icons/custom-icon-design/pretty-office-3/256/Star-Full-icon.png', isFolder: false },
                    { name: 'cdef', saveDate: 199, imgUrl: 'http://icons.iconarchive.com/icons/custom-icon-design/pretty-office-3/256/Star-Full-icon.png', isFolder: false },
                    { name: 'defg', saveDate: 198, imgUrl: 'http://icons.iconarchive.com/icons/custom-icon-design/pretty-office-3/256/Star-Full-icon.png', isFolder: false },
                    { name: 'efgh', saveDate: 197, imgUrl: 'http://icons.iconarchive.com/icons/custom-icon-design/pretty-office-3/256/Star-Full-icon.png', isFolder: false },
                    { name: 'fghi', saveDate: 196, imgUrl: 'http://icons.iconarchive.com/icons/custom-icon-design/pretty-office-3/256/Star-Full-icon.png', isFolder: false },
                    { name: 'ghij', saveDate: 195, imgUrl: 'http://icons.iconarchive.com/icons/custom-icon-design/pretty-office-3/256/Star-Full-icon.png', isFolder: false },
                    { name: 'hijk', saveDate: 20, imgUrl: 'http://icons.iconarchive.com/icons/custom-icon-design/pretty-office-3/256/Star-Full-icon.png', isFolder: false },
                    { name: 'ijkl', saveDate: 10, imgUrl: 'http://icons.iconarchive.com/icons/custom-icon-design/pretty-office-3/256/Star-Full-icon.png', isFolder: false }
                ]};

                imageSaverModule.addParentReferences(data);
                callback(data);
            }
        },

        setSavedItems: function (items) {
            console.log('saving items below');
            console.log(items);
            imageSaverModule.removeParentReferences(items);
            chrome.storage.local.set({'root': items});
            imageSaverModule.addParentReferences(items);
        }
    };
    return module;
});

imageSaverModule.addParentReferences = function (folder) {
    if (!folder)
        return;
    if (!folder.isFolder) // don't do anything if its not a folder
        return;
    for (var i = 0; i < folder.folderContents.length; i++) {
        folder.folderContents[i].parent = folder;
        imageSaverModule.addParentReferences(folder.folderContents[i]);
    }
};

imageSaverModule.removeParentReferences = function (folder) {
    if (folder)
        folder.parent = null;
    if (folder.isFolder) {
        for (var i = 0; i < folder.folderContents.length; i++) {
            imageSaverModule.removeParentReferences(folder.folderContents[i]);
        }
    }
};

imageSaverModule.filter('ellipsify', function () {
    return function (input, charLength) {
        var length = charLength ? charLength : 15;
        if (input.length < length)
            return input;
        return input.substr(0, length - 3).trim() + "..."; // elipsify!
    }
});

imageSaverModule.beingDrug = undefined; // variable to hold moving value

imageSaverModule.directive('draggable', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element = jQuery(element[0]);
            element.draggable({
                revert: true,
                start: function (event, ui) {
                    element.children('div').children('a').attr('ng-disabled', 'true');
                    element.parent('a').siblings('a').children('img').hide();
                    element.addClass('dragging');
                    imageSaverModule.beingDrug = scope.i;
                },
                stop: function (event, ui) {
                    element.removeClass('dragging');
                    element.parent('a').siblings('a').children('img').show();
                    imageSaverModule.beingDrug = undefined;
                }
            });
        }
    };
});

imageSaverModule.directive('droppable', function ($compile) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element = jQuery(element[0]);
            element.droppable({
                accept: "td",
                hoverClass: "drop-hover",
                drop: function (event, ui) {
                    var moveTo = scope.i ? scope.i : scope.b.folder;
                    var moving = imageSaverModule.beingDrug;
                    imageSaverModule.beingDrug = undefined;
                    var currentFolder = scope.folder;
                    if (!moveTo.isFolder)
                        return;

                    moveTo.folderContents.push(moving);
                    moving.parent = moveTo;

                    currentFolder.folderContents = imageSaverModule.remove(currentFolder.folderContents, moving);
                    scope.folder = currentFolder;

                    scope.forceUpdate();

                    scope.saveRoot();
                }
            });
        }
    };
});

imageSaverModule.directive('editable', function () {
    return {
        restrict: 'E',
        scope: {
            ngClick: '&',
            edit: '=',
            value: '=',
            folder: '=',
            update: '&'
        },
        transclude: true,
        link: function (scope, element, attrs) {
            scope.removeTextbox = function () {
                scope.folder.name = element.children('span').children('input').val();
                scope.folder.editing = undefined;
                scope.update();
            };

            scope.handleKeyPress = function (event) {
                if (event.which == 13) { // handle only for enter key
                    scope.removeTextbox();
                }
            };

            scope.$watch('folder.editing', function (value) { // focus the text box when the pencil is clicked
                if (scope.folder.editing) {
                    element.children('span').children('input')[0].focus();
                }
            });
        },
        template: '<span ng-switch on="edit">' +
            '<input type="text" ng-switch-when="true" ng-keypress="handleKeyPress($event)" ng-blur="removeTextbox()" value="{{value}}"/>' +
            '<a ng-switch-default ng-click="ngClick()">{{value | ellipsify}}</a>' +
            '</span>'
    };
});

imageSaverModule.where = function (array, predicate) {
    var newarray = [];
    for (var i = 0; i < array.length; i++) {
        if (predicate(array[i])) {
            newarray.push(array[i]);
        }
    }
    return newarray;
};

imageSaverModule.remove = function (array, element) {
    var newarray = [];
    var indexOf = array.indexOf(element);
    for (var i = 0; i < array.length; i++) {
        if (i != indexOf) {
            newarray.push(array[i]);
        }
    }
    return newarray;
};

imageSaverModule.factory('downloadService', function ($http) {
    $http.defaults.useXDomain = true;

    var peek = function(array) {
        return array[array.length-1];
    };

    // todo - figure out how to make this limiting scope: like (function())() or something
    // for concurency if the user tries to download two different folders at the same time
    var rootZip;
    var folders = [];
    var indexes = [];
    var zips = [];

    var runNext = function() {
        if (folders.length < 1) { // no folders left to go through - base case
            downloadZip();
            return;
        }

        var i = peek(indexes);
        var f = peek(folders);
        var z = peek(zips);
        if (i < f.folderContents.length) {
            // keep state of current forwarding by one
            indexes.pop(); // get rid of old index
            indexes.push(i+1);
            var current = f.folderContents[i];
            if (current.isFolder) {
                indexes.push(0);
                folders.push(current);
                zips.push(z.folder(current.name));
                runNext();
            } else {
                // is a file
                $http.get(current.imgUrl, {responseType: 'arraybuffer'}).success(function(data, status, headers, config) {
                    var lastPeriod = current.imgUrl.lastIndexOf(".");
                    var extension = current.imgUrl.substr(lastPeriod, current.imgUrl.length - lastPeriod);
                    var name = current.name.replace(":", ".").replace(":",".");
                    z.file(name + extension, data);
                    runNext();
                });
            }
        } else { // folder is done
            folders.pop();
            indexes.pop();
            zips.pop();
            runNext();
        }
    };

    var downloadZip = function() {
        var content = rootZip.generate({type: "blob"});
        var saveas = document.createElement("iframe");
        saveas.style.display = "none";

        if(!!window.createObjectURL == false) {
            saveas.src = window.webkitURL.createObjectURL(content);
        }
        else {
            saveas.src = window.createObjectURL(content);
        }

        document.body.appendChild(saveas);
    };

    return {
        downloadImg: function(file) {
            var lastPeriod = file.imgUrl.lastIndexOf(".");
            var name = file.name.replace(":", ".").replace(":",".");
            var extension = file.imgUrl.substr(lastPeriod, file.imgUrl.length - lastPeriod);

            $http.get(file.imgUrl, { responseType: "arraybuffer"}).success(function(data, status, headers, config) {

                var saveas = document.createElement("iframe");
                saveas.style.display = "none";
                saveas.name = file.name + extension;

                var zip = new JSZip();
                zip.file(name + extension, data);

                var blob = zip.generate({ type: "blob"});

                if(!!window.createObjectURL == false) {
                    saveas.src = window.webkitURL.createObjectURL(blob);
                }
                else {
                    saveas.src = window.createObjectURL(blob);
                }

                document.body.appendChild(saveas);
            });
        },

        downloadFolder: function(folder) {
            rootZip = new JSZip();
            var mainFolder = rootZip.folder(folder.name);
            folders.push(folder);
            indexes.push(0);
            zips.push(mainFolder);
            runNext();
        }
    };
});