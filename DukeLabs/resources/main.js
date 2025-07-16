console.log("Hello from Dukelabs");

/* --- Constants Section --- */
const LB_PER_KG = 2.2;
const MILLI_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

/* Class definition section */
// define Experiment class
class Experiment {
    // declare private properties
    #id;
    #task;
    #budget;
    #startTime;
    #endTime;
    #complete;
    
    // define constructor to initialize all properties of an Experiment object
    constructor(id, task, budget, startTime, endTime, complete) {
        this.#id = id;
        this.#task = task;
        this.#budget = budget;
        this.#startTime = startTime;
        this.#endTime = endTime;
        this.#complete = complete;
    }

    // define static function to initialize a complete Experiment object
    static createCompleteExperiment(id, task, budget, startTime, endTime) {
        return new Experiment(id, task, budget, startTime, endTime, true);
    }
    // define static function to initialize an ongoing Experiment object
    static createOngoingExperiment(id, task, budget, startTime) {
        return new Experiment(id, task, budget, startTime, null, false);
    }

    // copy formatExperiment function logic into the toString operation
    // modify property references to print current objects private properties
    toString() {
        let result = "Experiment "+this.#id+" \""+this.#task+"\" ";
        result += "Budget: "+formatCurrency(this.#budget)+" ";
        result += this.#startTime.toLocaleString("en-GB", {timeZone: "Europe/London"})+" ";
        result += (this.#complete) ? this.#endTime.toLocaleString("en-GB", {timeZone: "Europe/London"}) : "on going";
        return result;
    }

    // create get property accessors
    get id() {
        return this.#id;
    }
    get task() {
        return this.#task;
    }
    get budget() {
        return this.#budget;
    }
    get startTime() {
        return this.#startTime;
    }
    get endTime() {
        return (this.#complete) ? this.#endTime : "ongoing";
    }
    get complete() {
        return this.#complete;
    }
    // create set property accessor that completes the experiment
    set complete(endTime) {
      this.#endTime = endTime;
      this.#complete = true;
    }

    getMeasurements() {
        return Array.from(data.getMeasurements(this.id));
    }

    addMeasurement(unit, value) {
        // calculate time of the measurement as an offset from the start of the experiment
        let duration = formatDuration(new Date().getTime() - this.#startTime.getTime());
        // create measurement and add it to the experiment
        data.addMeasurement(this.#id, new Measurement(unit, value, duration));
    }
}

// define Measurement class
class Measurement {
    // declare private properties
    #id;
    #unit;
    #value;
    #time;

    // create private static array of SI units of measure
    static #units = ["s","m","kg","A","K","mol","cd"];
    // create a private static property to store current highest id value
    static #maxId = 0;

    // define constructor to initialize all private properties of a Measurement object
    // validate that unit of measure is an SI unit
    constructor(unit, value, time) {
        this.#id = ++Measurement.#maxId;
        this.#unit = (Measurement.#units.indexOf(unit) == -1) ? null : unit;
        this.#value = value;
        this.#time = time;
    }

    // copy formatMeasurement function logic into the toString operation
    // modify property references to pint current objects private properties
    toString() {
        let result = "Measurement "+this.#id+" "+this.#unit+" "+this.#value+" "+this.#time;
        return result;
    }

    // create get property accessors
    get id() {
        return this.#id;
    }
    get unit() {
        return this.#unit;
    }
    get value() {
        return this.#value;
    }
    get time() {
        return this.#time;
    }
}

class ThoughtExperiment extends Experiment {
    // Add private property that represents an array of thoughts
    #thoughts = [];
    // initialise Experiment properties via superclass constructor
    // set budget as zero
    // initialise first thought
    constructor(id, task, thought, startTime, endTime, complete) {
        super(id, task, 0, startTime, endTime, complete);
        this.#thoughts[0] = thought;
    }

    // add set and get assessors for a thought array
    // return an entire array from the get accessor
    get thoughts(){
        return this.#thoughts;
    }
    // append a thought to an entire via set accessor
    set thought(thought) {
        this.#thoughts.push(thought);
    }
    
    // reuse superclass toString function
    // concatenate thoughts as a list of lines
    toString() {
        let result = super.toString()+"\nThoughts:";
        for (const thought of this.#thoughts) {
            result += "\n - "+thought;
        }
        return  result;
    }
}

// Add getMeasurements function to the Experiment prototype
// Experiment.prototype.getMeasurements = function() {
//     return Array.from(data.getMeasurements(this.id));
// }

/* --- Objects Section --- */
// An in-Memory "Database" with insert and search operations
const data = {
    allData : new Map(),  // a Map comprised of a Set of Measurements indexed by an Experiment object
    experiments : new Map(), // a Map comprised of Experiment objects indexed by ID
    measurements : new Map(), // a Map comprised of Measurement objects indexed by ID
     
    // Find an Experiment with a given ID
    getExperiment(eId) {
        return this.experiments.get(eId);
    },
    // Find a Measurement with a given ID
    getMeasurement(mId) {
        return this.measurements.get(mId);
    },
    // Find all Measurement objects for a given experiment ID
    getMeasurements(eId) {
        return this.allData.get(this.getExperiment(eId));
    },
    // Add a new Experiment object
    addExperiment(experiment) {
        this.experiments.set(experiment.id, experiment);
        this.allData.set(experiment, new Set());
    },
    // Add a new Measurement to an Experiment with a given ID
    addMeasurement(eId, measurement) {
        this.measurements.set(measurement.id, measurement);
        this.allData.get(this.getExperiment(eId)).add(measurement);
    }
}

// Create experiment objects
/* let experiment1 = {
    id: 101,
    task: "Measure Weight",
    budget: 123.45,
    startTime: new Date(2022, 3, 16, 6, 7),
    complete: false
};

let experiment2 = {
    id: 102,
    task: "Measure Length",
    budget: 321.54,
    startTime: new Date(2022, 4, 1, 14, 30),
    endTime: new Date(2022, 4, 2, 21, 12),
    complete: true
};

// Create measurement objects
let measurement1 = {
    id: 1,
    unit: "kg",
    value: 42,
    time: 'PT2M12S' // ISO format string
};

let measurement2 = {
    id: 2,
    unit: "kg",
    value: 40,
    time: 'PT3M10S'
};

let measurement3 = {
    id: 3,
    unit: "kg",
    value: 3,
    time: 'PT3M55S'
};


let measurement4 = {
    id: 4,
    unit: "m",
    value: 12,
    time: 'PT20M'
};

let measurement5 = {
    id: 5,
    unit: "m",
    value: 10,
    time: 'PT1H20M10S'
}; */

// Instantiate Experiment objects
let experiment1 = Experiment.createOngoingExperiment(101, "Measure Weight", 123.45,
    new Date(2022,3,16,6,7));
let experiment2 = Experiment.createCompleteExperiment(102, "Measure Length", 321.54,
    new Date(2022,4,1,14,30),
    new Date(2022,4,2,21,12));

// Instantiate Measurement objects
let measurement1 = new Measurement("kg",42,'PT2M12S');
let measurement2 = new Measurement("kg",40,'PT3M10S');
let measurement3 = new Measurement("kg",3,"PT3M55S");
let measurement4 = new Measurement("m",12,"PT20M");
let measurement5 = new Measurement("m",10,"PT1H22M:10S");

// Add experiments and measurements to data object
data.addExperiment(experiment1);
data.addExperiment(experiment2);
data.addMeasurement(experiment1.id,measurement1);
data.addMeasurement(experiment1.id,measurement2);
data.addMeasurement(experiment1.id,measurement3);
data.addMeasurement(experiment2.id,measurement4);
data.addMeasurement(experiment2.id,measurement5);

// create and populate and array of Measurement objects
//let measurements = [measurement1, measurement2, measurement3];
// let measurements = Array.from(data.getMeasurements(101));
let measurements = data.getExperiment(101).getMeasurements();

/* --- Function Section --- */
function lb2kg(lb) {
    return lb / LB_PER_KG;
}

function kg2lb(kg) {
    return kg * LB_PER_KG;
}

// parse duration from ISO format "PT<hours>H<minutes>M<seconds>S" to milliseconds
function parseDuration(duration) {
    let durationPattern = /PT(?:([.,\d]+)H)?(?:([.,\d]+)M)?(?:([.,\d]+)S)?/;
    let matches = duration.match(durationPattern);
    let hours = (matches[1] === undefined) ? 0 : matches[1];
    let minutes = (matches[2] === undefined) ? 0 : matches[2];
    let seconds = (matches[3] === undefined) ? 0 : matches[3];
    
    return (parseInt(hours) * SECONDS_PER_HOUR +
            parseInt(minutes) * SECONDS_PER_MINUTE +
            parseInt(seconds)) * MILLI_PER_SECOND;

}

// format duration from milliseconds into ISO format as "PT<hours>H<minutes>M<seconds>S"
function formatDuration(duration) {
    if(duration === 0) {
        return "PT0S";
    }

    let totalSeconds = Math.trunc(duration / MILLI_PER_SECOND);
    let hours = Math.trunc(totalSeconds / SECONDS_PER_HOUR);
    let minutes = Math.trunc((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
    let seconds = Math.trunc(totalSeconds % SECONDS_PER_MINUTE);
    let result = "PT";
    
    if(hours != 0) {
        result += hours + "H";
    }

    if(minutes != 0) {
        result += minutes + "M";
    }
    if(seconds != 0) {
        result += seconds + "S";
    }

    return result;
}

// Compare two measurement objects
function compareMeasurements(m1, m2) {
    let result = 0;
    if (m1.value < m2.value) {
        result = -1;
    } else {
        if (m1.value == m2.value) {
            result = 0;
        } else {
            result = 1;
        }
    }
    //return result;
    return m1.value - m2.value; // another comparison way
}

// Iterate through measurements array and calculate average value version 1 (assuming single unit)
function calculateAverageMeasurement(measurements) {
    let result = 0;
    for (const measurement of measurements) {
        result += parseFloat(measurement.value);
    }
    result = (result/measurements.length).toFixed(2); // fix the result to two digits after decimal point
    return result;
}

// Iterate through measurements array and calculate average value version 2 (per each unit)
function calculateAverageMeasurements(measurements) {
    let result = {
        kgTotal: 0.0,
        kgValues: 0,
        mTotal: 0.0,
        mValues: 0
    };
    for (const measurement of measurements) {
        switch (measurement.unit) {
            case "kg":
                result.kgTotal += parseFloat(measurement.value);
                result.kgValues++;
                break;
            case "m":
                result.mTotal += parseFloat(measurement.value);
                result.mValues++;
                break;
        }
    }
    result.kgTotal = (result.kgTotal/result.kgValues).toFixed(2);
    result.mTotal = (result.mTotal/result.mValues).toFixed(2);
    return result;
}

// format currency
function formatCurrency(value){
    const format = new Intl.NumberFormat('en-GB', {style: 'currency', currency: 'GBP',minimumFractionDigits: 0, maximumFractionDigits: 2});
    return format.format(value);
}

// Format Experiment object
/* function formatExperiment(experiment) {
    let result = "Experiment "+experiment.id+" \""+experiment.task+"\" ";
    result += "Budget: "+formatCurrency(experiment.budget)+" ";
    result += experiment.startTime.toLocaleString("en-GB", {timeZone: "Europe/London"})+" ";
    result += (experiment.complete) ? experiment.endTime.toLocaleString("en-GB", {timeZone: "Europe/London"}) : "on going";
    return result;
 } */

// Format Measurement object
/* function formatMeasurement(measurement) {
    let result = "Measurement "+measurement.id+" "+measurement.unit+" "+measurement.value+" "+measurement.time;
    return result;
} */


/* --- Test Section --- */
// Convert between pounds and kilograms
//let lb = kg2lb(measurement1.value);
/*let lb = kg2lb(data.getMeasurement(1).value);
let kg = lb2kg(lb);
console.log("Pounds: " + lb + " Kilograms: " + kg);*/

// Parse and format duration milliseconds and string representations
//let durationMS = parseDuration(measurement3.time);
/*let durationMS = parseDuration(data.getMeasurement(3).time);
console.log("Meausurement time offset from the start of the experiment: " + durationMS);*/

// Calculate measurement time
//let measurementTime = experiment2.startTime.getTime() + durationMS;
/*let measurementTime = data.getExperiment(102).startTime.getTime() + durationMS;
console.log("Measurement time: " + new Date(measurementTime));*/

// Calculate experiment duration
// let durationTime = formatDuration(experiment2.endTime - experiment2.startTime);
/*let durationTime = formatDuration(data.getExperiment(102).endTime - data.getExperiment(102).startTime);
console.log("Experiment duration: " + durationTime);*/

// Compare measurements:  smaller -1, equal 0, greater 1 value
// console.log("Compare Measurements: " + compareMeasurements(measurement1, measurement2));
/*console.log("Compare Measurements: " + compareMeasurements(data.getMeasurement(1), data.getMeasurement(2)));*/

// Calculate measurements average value version 1 (assuming single unit)
/*let avgValue = calculateAverageMeasurement(measurements);*/
// let avgValue = calculateAverageMeasurement([]);
/*console.log("Average value: " + avgValue);*/

// Calculate measurements average value version 2 (per each unit)
/* measurements[3] = measurement4;
measurements[4] = measurement5; */
//for (const measurement of Array.from(data.getMeasurements(102))) {
/* for (const measurement of data.getExperiment(102).getMeasurements()) {
    measurements.push(measurement);
} */
/*measurements = Array.of(...measurements, ...data.getExperiment(102).getMeasurements());

let avgValues = calculateAverageMeasurements(measurements);
console.log("Average values Kg: " + avgValues.kgTotal+", m: "+avgValues.mTotal);*/

// Print each experiment
// console.log(formatExperiment(experiment1));
//console.log(formatExperiment(experiment2));
// Retrieve experiments and measurements from a data object
/*console.log(data.getExperiment(101).toString());
console.log(data.getMeasurement(1).toString());
console.log(data.getMeasurement(2).toString());
console.log(data.getMeasurement(3).toString());
console.log(data.getExperiment(102).toString());
for (const measurement of data.getExperiment(102).getMeasurements()) {
    console.log(measurement.toString());
}*/

// Sort measurements
/*measurements.sort(compareMeasurements);*/

// Iterate and print array of measurements
/* for (const measurement of measurements) {
    console.log(formatMeasurement(measurement));
} */
/*
for (const measurement of measurements) {
    console.log(measurement.toString());
} */

// Alter an experiment object and introspect its properties
/*let experiment = data.getExperiment(101);
Object.freeze(experiment);
experiment.notes = "This is fun";
console.log(Object.hasOwn(experiment,"notes"));
console.log(Object.isExtensible(experiment));
console.log(Object.isSealed(experiment));
console.log(Object.isFrozen(experiment));
console.log(Object.entries(experiment));*/

// Instantiate and use a Thought Experiment object
/*let experiment3 = new ThoughtExperiment(103,"Predict race results","Predict the winner of any race.", new Date(), null, false);
experiment3.thought = "Provided it only involves spherical horses moving through a vacuum.";
console.log(experiment3.toString());*/

// Test addMeasurement and getMeasurements functions of the Experiment
/*experiment1.addMeasurement("kg",3);
console.log(experiment1.getMeasurements().toString());*/

/* --- UI events and Functions Section --- */
function findExperiment(event) {
    event.preventDefault();
    // retrieve target elements from the document
    let exp_id_field = document.getElementById("exp_id_field");
    let exp_task_field = document.getElementById("exp_task_field");
    let exp_budget_field = document.getElementById("exp_budget_field");
    let exp_startTime_field = document.getElementById("exp_startTime_field");
    let exp_endTime_field = document.getElementById("exp_endTime_field");
    let exp_complete_field = document.getElementById("exp_complete_field");
    let mea_add_button = document.getElementById("mea_add_button");
    // find experiment
    let exp_id = parseInt(exp_id_field.value);
    let experiment = data.getExperiment(exp_id);
    if(experiment == undefined) {
        alert("Experiment with id" + exp_id + " not found");
        resetExperimentForm();
        resetMeasurementsTable();
    } else {
        exp_task_field.value = experiment.task;
        exp_budget_field.value = formatCurrency(experiment.budget);
        exp_startTime_field.value = experiment.startTime.toISOString().slice(0, -1);
        if(experiment.complete) {
            exp_complete_field.checked = true;
            exp_endTime_field.value = experiment.endTime.toISOString().slice(0, -1);
            exp_complete_field.disabled = true;
            mea_add_button.disabled = true;
        }
        else {
            exp_complete_field.checked = false;
            exp_endTime_field.value = "";
            exp_complete_field.disabled = false;
             mea_add_button.disabled = false;
        }
        displayMeasurements(experiment);
    }
}

function displayMeasurements(experiment) {
    resetMeasurementsTable();
    let measurements = experiment.getMeasurements();
    let average = calculateAverageMeasurement(measurements);
    let max = Number.MIN_VALUE;
    let min = Number.MAX_VALUE;

    if(measurements.length == 0) {
        average = 0;
    }
    else {
        let mea_table = document.getElementById("mea_table");
        for(const measurement of measurements) {
            max = Math.max(max, measurement.value);
            min = Math.min(min, measurement.value);

            let id_cell = document.createElement("td");
            id_cell.appendChild(document.createTextNode(measurement.id));
            let unit_cell = document.createElement("td");
            unit_cell.appendChild(document.createTextNode(measurement.unit));
            let value_cell = document.createElement("td");
            value_cell.appendChild(document.createTextNode(measurement.value));
            let time_cell = document.createElement("td");
            time_cell.appendChild(document.createTextNode(measurement.time));

            let mea_row = document.createElement("tr");
            mea_row.appendChild(id_cell);
            mea_row.appendChild(unit_cell);
            mea_row.appendChild(value_cell);
            mea_row.appendChild(time_cell);
            mea_table.appendChild(mea_row);

        }

        let averageRatio = ((average - min) * 100) / (max - min); // equivalent of average in a scale between 0 and 100
        //let exp_average_field = document.getElementById("exp_average_field");
        //exp_average_field.value = averageRatio;
        let exp_average_value = document.getElementById("exp_average_value");
        exp_average_value.style.width = averageRatio + '%';
        exp_average_value.innerText = average;
    }
}

function completeExperiment(event) {
    let exp_id_field = document.getElementById("exp_id_field");
    let exp_complete_field = document.getElementById("exp_complete_field");
    let mea_add_button = document.getElementById("mea_add_button");
    let exp_id = parseInt(exp_id_field.value);
    let experiment = data.getExperiment(exp_id);

    let date = new Date();
    date.setMilliseconds(0);
    experiment.complete = date; // using set accessor

    exp_complete_field.checked = true;
    exp_endTime_field.value = experiment.endTime.toISOString().slice(0, -1);
    exp_complete_field.disabled = true;
    mea_add_button.disabled = true;
}

function showAddMeasurementDialog(event) {
    let mea_add_dialog = document.getElementById("mea_add_dialog");
    mea_add_dialog.showModal();
}

function addMeasurement(event) {
    event.preventDefault();

    let exp_id_field = document.getElementById("exp_id_field");
    let mea_unit_input = document.getElementById("mea_unit_input");
    let mea_value_input = document.getElementById("mea_value_input");
    let exp_id = parseInt(exp_id_field.value);
    let experiment = data.getExperiment(exp_id);

    experiment.addMeasurement(mea_unit_input.value, mea_value_input.value);

    let mea_add_dialog = document.getElementById("mea_add_dialog");
    let mea_form = document.getElementById("mea");

    mea_form.reset();
    mea_add_dialog.close();
    displayMeasurements(experiment);
}

function cancelAddMeasurement(event) {
    let mea_add_dialog = document.getElementById("mea_add_dialog");
    mea_add_dialog.close();
    // reset is already done by the button
}

function resetMeasurementsTable() {
    let mea_table = document.getElementById("mea_table");
    while(mea_table.lastElementChild) {
        mea_table.removeChild(mea_table.lastElementChild);
    }
}

function resetExperimentForm() {
    let exp_form = document.getElementById("exp");
    let mea_add_button = document.getElementById("mea_add_button");
    //let exp_average_field = document.getElementById("exp_average_field");
    let exp_average_value = document.getElementById("exp_average_value");

    exp_form.reset();
    //exp_average_field.value = 0; // since it is not an input element it will not be reset by form
    exp_average_value.style.width = '0%';
    exp_average_value.innerText = '';
    mea_add_button.disabled = true;
}

window.addEventListener("load", (event) => {
    let exp_find_button = document.getElementById("exp_find_button");
    let exp_complete_field = document.getElementById("exp_complete_field");
    let mea_add_button = document.getElementById("mea_add_button");
    let mea_ok_button = document.getElementById("mea_ok_button");
    let mea_reset_button = document.getElementById("mea_reset_button");

    exp_find_button.addEventListener("click", findExperiment);
    exp_complete_field.addEventListener("change", completeExperiment);
    mea_add_button.addEventListener("click", showAddMeasurementDialog);
    mea_ok_button.addEventListener("click", addMeasurement);
    mea_reset_button.addEventListener("click", cancelAddMeasurement);
});

