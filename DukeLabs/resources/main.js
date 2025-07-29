import {data, calculateAverageMeasurement, formatCurrency}
    from './data_service.js';

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
    //let experiment = data.getExperiment(exp_id);
    data.findExperiment(exp_id).then((experiment) => {
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
    }).catch((error) => {
        alert("Experiment with id " + exp_id + " not found");
        resetExperimentForm();
        resetMeasurementsTable();
    });
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

    try {
        experiment.addMeasurement(mea_unit_input.value, mea_value_input.value);

        let mea_add_dialog = document.getElementById("mea_add_dialog");
        let mea_form = document.getElementById("mea");

        mea_form.reset();
        mea_add_dialog.close();
    }catch(error) {
        alert(error);
    }

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
    let image = document.getElementsByClassName("img_slogan").item(0);
    
    setInterval(animateImage, 1000, image);

    exp_find_button.addEventListener("click", findExperiment);
    exp_complete_field.addEventListener("change", completeExperiment);
    mea_add_button.addEventListener("click", showAddMeasurementDialog);
    mea_ok_button.addEventListener("click", addMeasurement);
    mea_reset_button.addEventListener("click", cancelAddMeasurement);
});

function animateImage(image) {
    image.classList.toggle("grey"); // adds .grey class if it is not there or remove it if it is there
}