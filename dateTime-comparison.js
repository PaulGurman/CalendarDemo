var testContent = document.getElementById("content");

var startDateList = [];
var durationList = [];
var startDate = document.getElementById('startDateInput');
var endDate = document.getElementById('endDateInput');

var availableSlots = [];

async function search() {
    //  console.log(globalEventData_google);
    //  console.log(globalEventData);
    console.log("We searching");
    DTList = [];
    startDateList = [];
    availableSlots = [];
    durationList = [];

    // await get_GlobalEventData();
    // await get_GlobalEventDataGoogle().then(() => { });

    await get_GlobalEventData().then(event => createDTList(event));
    await getGlobalEventData_google().then(event => createDTList(event));

    createAvailableSlots();

    //console.log(availableSlots);
}

function createDTList(eventList) {

    if(!eventList) {
        return;
    }
    for (let i of eventList){
        dS = new Date(i.start.dateTime);

        let alreadyPresent = false;

        for(let j of startDateList) {
            if(dS.getTime() == j) { alreadyPresent = true; }
        }
        if(!alreadyPresent)
         startDateList.push(dS.getTime());
        dE = new Date(i.end.dateTime);
        if(!alreadyPresent)
            durationList.push(dE.getTime() - dS.getTime());
    }
}

function createAvailableSlots() {
    start = new Date(startDate.value + 'T00:00:00');
    start.setHours(start.getHours() - 3);
    end = new Date(endDate.value + 'T23:59:59');
    end.setHours(end.getHours() - 3);
    console.log(start, end);

    tracker = start.getTime();

    while (tracker < end.getTime()) {
        greatestDuration = 0;
        conflictPresent = false;
        
        for(let i = 0; i < startDateList.length; i++){
            
            if(tracker >= startDateList[i] && tracker < (startDateList[i] + durationList[i])) {
                conflictPresent = true;
                if(greatestDuration == 0) {
                    greatestDuration = i;
                }
                if((startDateList[greatestDuration] + durationList[greatestDuration]) >= (startDateList[greatestDuration] + durationList[greatestDuration]))
                    greatestDuration = i;
            }
        }

        if(conflictPresent) {
            tracker += (startDateList[greatestDuration] + durationList[greatestDuration]) - tracker;

            while(tracker % 1800000 != 0) {
                tracker++;
            }

        } else {
            
            availableSlots.push(new Date(tracker));
            tracker += 1800000;
        }
    
        //console.log(availableSlots);
    for(let i in availableSlots) {
        if(availableSlots[i].getHours() < 8 || availableSlots[i].getHours() > 18) {
            availableSlots.splice(i, 1);
        }
    }

    }

    updateDOM();
}

function updateDOM() {
    var content = document.getElementById('slots_container');
    content.innerHTML = '';

    for(let i in availableSlots) {
        slot = availableSlots[i];
        //console.log(slot);
        let item = document.createElement("div");
        let button = document.createElement("button");
        button.onclick = function() {
            //console.log(slot);
            dT = new Date(button.innerHTML);
            let s = window.prompt("What is the subject for your event at " + dT);
            if(s == '') {
                window.alert("Please include a subject");
            } else {
                createEvent_Google(dT, s);
                createEvent_Outlook(dT, s);
                availableSlots.splice(i, 1);
                updateDOM();
            }
        };
        button.innerHTML = slot;

        item.append(button);
        content.appendChild(item);
    }
}

