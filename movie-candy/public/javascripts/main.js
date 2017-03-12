var currentSite ="#SiteLocal";
function loadVideoList(request) {
    $.post("/video.json", request, function (data, status) {
        blueimp.Gallery(
            data,
            {
                container: '#blueimp-gallery-video',
                carousel: true
            }
        );
        console.log(data);
        var s = '';
        currentSite ="#SiteLocal";
        data.forEach(function (element) {
            if (element.href.indexOf('node-cn')!=-1) {
                currentSite ="#Site1";
            } else if (element.href.indexOf('node-uk')!=-1) {
                currentSite ="#Site2";
            }
        });
        showTraffic();
        $("video").bind("play", function (data, event) { $("#file-list").html("<strong>播放中:</strong><br/>" + data.target.src) }); 
        $("video").bind("pause", function (data, event) { $("#file-list").html("<strong>暂停播放</strong>") }); 
        $("video").bind("stop", function (data, event) { $("#file-list").html("") }); 
    });
}


$(document).ready(function () {
    showTraffic();
    $('#cdn-toggle').change(function () {
        loadVideoList({ cdn: $("#cdn-toggle input").prop("checked") });
    })
   
    loadVideoList({});
});

function showTraffic() {
    sites = ['#Site1', '#Site2', '#SiteLocal'];
    for (index in sites) {
        site = sites[index];
        if (site == currentSite) {
            $(site).show();
        } else {
            $(site).hide();
        }
    }
}
