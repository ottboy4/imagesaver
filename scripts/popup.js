//{ image object
//    saveDate: "",
//    imgUrl: "",
//    name: "",
//    isFolder: false,
//    parent: folder
//    folderContents: image[] - recursive folders/images
//}
// http://icongal.com/gallery/image/176142/delete.png -- delete icon

console.log('popup.js running');
imageSaverModule.controller('QuickViewCtrl', function QuickViewCtrl($scope, imageService, downloadService) {

    var init = function (rootFolder) {
        // variables
        var columns = 3;

        // scope variables
        $scope.folder = rootFolder;
        $scope.sortType = 'name';
        $scope.breadcrumb = [
            {name: "", folder: rootFolder}
        ];

        // updators
        var updateRows = function () {
            var rows = [];
            for (var i = 0; i < $scope.folder.folderContents.length; i++) {
                if (i % columns == 0) {
                    rows.push([]);
                }
                rows[rows.length - 1].push($scope.folder.folderContents[i]);
            }
            $scope.imageRows = rows;
        };

        var updateBreadcrumbs = function () {
            var breadcrumb = [
                {name: $scope.folder.name, folder: $scope.folder}
            ];
            var parent = $scope.folder.parent;
            while (parent) {
                breadcrumb = [
                    {name: parent.name, folder: parent}
                ].concat(breadcrumb);
                parent = parent.parent;
            }

            if (breadcrumb.length > 4) {
                console.log('ellipsing breadcrumb');
                var first = breadcrumb[0];
                var second = breadcrumb[1];
                var thirdLast = breadcrumb[breadcrumb.length - 3];
                var secondLast = breadcrumb[breadcrumb.length - 2];
                var last = breadcrumb[breadcrumb.length - 1];
                thirdLast.name = '...'; // ellipse it
                breadcrumb = [first, second, thirdLast, secondLast, last];
            }

            $scope.breadcrumb = breadcrumb;
        };

        var sort = function () {
            var folders = imageSaverModule.where($scope.folder.folderContents, function (folder) {
                return folder.isFolder;
            });
            var files = imageSaverModule.where($scope.folder.folderContents, function (file) {
                return !file.isFolder;
            });
            var property = $scope.sortType;
            var sorter = function (a, b) {
                if ((typeof a[property]) === 'string') {
                    return a[property].localeCompare(b[property]);
                } else if ((typeof a[property]) === 'number') {
                    return a[property] - b[property];
                }
                return false;
            };
            folders.sort(sorter);
            files.sort(sorter);
            var folder = $scope.folder;
            folder.folderContents = folders.concat(files);
            $scope.folder = folder;
        };

        // event calls
        $scope.handleDownload = function (file) {
            if (file.isFolder) {
                downloadService.downloadFolder(file);
            } else {
                downloadService.downloadImg(file);
            }
        };

        $scope.setSortType = function(sortType) {
            imageService.getSavedItems(function(val) {});
            $scope.sortType = sortType;
            sort();
            updateRows();
        };

        $scope.handleElementClick = function (element) {
            if (element === imageSaverModule.beingDrug)
                return;
            if (element.isFolder) {
                $scope.folder = element;
            } else {
                // not a folder handle click for non folders
            }
        };

        $scope.forceUpdate = function() {
            $scope.$apply(function() {
                $scope.update();
            });
        };

        $scope.update = function() {
            sort();
            updateRows();
            updateBreadcrumbs();
        };

        $scope.handleBreadcrumb = function (breadcrumb) {
            $scope.folder = breadcrumb.folder;
        };

        $scope.addFolder = function() {
            $scope.folder.folderContents.push({
                name: 'New Folder',
                isFolder: true,
                parent: $scope.folder,
                saveDate: new Date().toISOString(),
                imgUrl: "https://cdn1.iconfinder.com/data/icons/HYDROPRO/Folder-2.png",
                folderContents: [],
                editing: true
            });
            $scope.saveRoot();
            $scope.update();
        };

        $scope.editFolder = function(folder) {
            folder.editing = true;
        };

        $scope.deleteFolder = function(folder) {
            // TODO add chicken switch
            folder.parent.folderContents = imageSaverModule.remove(folder.parent.folderContents, folder);
            $scope.saveRoot();
            $scope.update();
        };

        $scope.saveRoot = function() {
            imageService.setSavedItems(rootFolder);
        };

        $scope.$watch('folder', function () {
            $scope.update();
        });

        // initial state setup
        $scope.update();

        $scope.$apply(); // apply changes to angular
    };

    imageService.getSavedItems(init);
});
