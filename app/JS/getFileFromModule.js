ZOHO.embeddedApp.on("PageLoad", async function (data) {
    // console.log(data);
    const module = data.Entity;
    const id = data.EntityId;

    const record = await ZOHO.CRM.API.getRecord({
        Entity: module,
        RecordID: id
    })
    const file = await ZOHO.CRM.API.getFile({ id: record.data[0].File[0].file_Id })
    fileURL = URL.createObjectURL(file);
    
    if (file.type === "application/pdf") {
        document.getElementById("iframe").removeAttribute("hidden");
        document.getElementById("iframe").setAttribute("src", "web/viewer.html?file="+fileURL);
    }
    else if (file.type.includes("image/")){        
        document.getElementById("img").setAttribute("src", fileURL);
        document.getElementById("img").removeAttribute("hidden");
    }
    else{
        document.write("Sorry ! File type not supported for preview..");
    }
});

ZOHO.embeddedApp.init();