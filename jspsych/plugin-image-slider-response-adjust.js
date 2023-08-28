var jsPsychImageSliderResponseAdjust = (function(jspsych) {
    'use strict';

    const info = {
        name: "image-slider-response-adjust",
        parameters: {
            /** The image to be displayed */
            stimulus: {
                type: jspsych.ParameterType.IMAGE,
                pretty_name: "Stimulus",
                default: undefined,
            },
            /** Set the image height in pixels */
            stimulus_height: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Image height",
                default: null,
            },
            /** Set the image width in pixels */
            stimulus_width: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Image width",
                default: null,
            },
            /** Maintain the aspect ratio after setting width or height */
            maintain_aspect_ratio: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: "Maintain aspect ratio",
                default: true,
            },
            /** Sets the minimum value of the slider. */
            min: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Min slider",
                default: 0,
            },
            /** Sets the maximum value of the slider */
            max: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Max slider",
                default: 100,
            },
            /** Sets the starting value of the slider */
            slider_start: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Slider starting value",
                default: 50,
            },
            /** Sets the step of the slider */
            step: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Step",
                default: 1,
            },
            /** Array containing the labels for the slider. Labels will be displayed at equidistant locations along the slider. */
            labels: {
                type: jspsych.ParameterType.HTML_STRING,
                pretty_name: "Labels",
                default: [],
                array: true,
            },
            /** Width of the slider in pixels. */
            slider_width: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Slider width",
                default: null,
            },
            /** Slider direction ltr or rtl. */
            slider_dir: {
                type: jspsych.ParameterType.STRING,
                pretty_name: "Slider direction",
                default: null,
            },
            /** Label of the button to advance. */
            button_label: {
                type: jspsych.ParameterType.STRING,
                pretty_name: "Button label",
                default: "Continue",
                array: false,
            },
            /** If true, the participant will have to move the slider before continuing. */
            require_movement: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: "Require movement",
                default: false,
            },
            /** Any content here will be displayed below the slider. */
            prompt: {
                type: jspsych.ParameterType.HTML_STRING,
                pretty_name: "Prompt",
                default: null,
            },
            /** How long to show the stimulus. */
            stimulus_duration: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Stimulus duration",
                default: null,
            },
            /** How long to show the trial. */
            trial_duration: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Trial duration",
                default: null,
            },
            /** If true, trial will end when user makes a response. */
            response_ends_trial: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: "Response ends trial",
                default: true,
            },
            /**
             * If true, the image will be drawn onto a canvas element (prevents blank screen between consecutive images in some browsers).
             * If false, the image will be shown via an img element.
             */
            render_on_canvas: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: "Render on canvas",
                default: true,
            },
        },
    };
    /**
     * **image-slider-response** ADJUST VERSION
     *
     * jsPsych plugin for showing an image stimulus and getting a slider response
     *
     * @author Josh de Leeuw
     * Modified by: Aniko Kusztor
     */
    class ImageSliderResponseAdjustPlugin {
        constructor(jsPsych) {
            this.jsPsych = jsPsych;
        }

        trial(display_element, trial) {
            var height, width;
            var html;
            // half of the thumb width value from jspsych.css, used to adjust the label positions
            var half_thumb_width = 7.5;
            if (trial.render_on_canvas) {
                var image_drawn = false;
                // first clear the display element (because the render_on_canvas method appends to display_element instead of overwriting it with .innerHTML)
                if (display_element.hasChildNodes()) {
                    // can't loop through child list because the list will be modified by .removeChild()
                    while (display_element.firstChild) {
                        display_element.removeChild(display_element.firstChild);
                    }
                }
                // create wrapper div, canvas element and image
                var content_wrapper = document.createElement("div");
                content_wrapper.id = "jspsych-image-slider-response-adjust-wrapper";
                content_wrapper.style.margin = "100px 0px";
                var canvas = document.createElement("canvas");
                canvas.id = "jspsych-image-slider-response-adjust-stimulus";
                canvas.style.margin = "0";
                canvas.style.padding = "0";
                var ctx = canvas.getContext("2d");
                var img = new Image();
                img.onload = () => {
                    // if image wasn't preloaded, then it will need to be drawn whenever it finishes loading
                    if (!image_drawn) {
                        getHeightWidth(); // only possible to get width/height after image loads
                        ctx.drawImage(img, 0, 0, width, height);
                    }

                    // add image filter modification based on slider starting position here:
                    var slsVal;
                    slsVal = trial.slider_start;
                    canvas.style.filter = `saturate(${slsVal}%)`;
                    //canvas.style.filter = `contrast(${slsVal}%)`;
                };
                img.src = trial.stimulus;
                // get/set image height and width - this can only be done after image loads because uses image's naturalWidth/naturalHeight properties
                const getHeightWidth = () => {
                    if (trial.stimulus_height !== null) {
                        height = trial.stimulus_height;
                        if (trial.stimulus_width == null && trial.maintain_aspect_ratio) {
                            width = img.naturalWidth * (trial.stimulus_height / img.naturalHeight);
                        }
                    } else {
                        height = img.naturalHeight;
                    }
                    if (trial.stimulus_width !== null) {
                        width = trial.stimulus_width;
                        if (trial.stimulus_height == null && trial.maintain_aspect_ratio) {
                            height = img.naturalHeight * (trial.stimulus_width / img.naturalWidth);
                        }
                    } else if (!(trial.stimulus_height !== null && trial.maintain_aspect_ratio)) {
                        // if stimulus width is null, only use the image's natural width if the width value wasn't set
                        // in the if statement above, based on a specified height and maintain_aspect_ratio = true
                        width = img.naturalWidth;
                    }
                    canvas.height = height;
                    canvas.width = width;
                };
                getHeightWidth(); // call now, in case image loads immediately (is cached)
                // create container with slider and labels
                var slider_container = document.createElement("div");
                slider_container.classList.add("jspsych-image-slider-response-adjust-container");
                slider_container.style.position = "relative";
                slider_container.style.margin = "0 auto 3em auto";
                if (trial.slider_width !== null) {
                    slider_container.style.width = trial.slider_width.toString() + "px";
                }
                // create html string with slider and labels, and add to slider container
                html =
                    '<input type="range" class="jspsych-slider" value="' +
                    trial.slider_start +
                    '" min="' +
                    trial.min +
                    '" max="' +
                    trial.max +
                    '" step="' +
                    trial.step +
                    '" id="jspsych-image-slider-response-adjust-response"></input>';
                html += "<div>";
                for (var j = 0; j < trial.labels.length; j++) {
                    var label_width_perc = 100 / (trial.labels.length - 1);
                    var percent_of_range = j * (100 / (trial.labels.length - 1));
                    var percent_dist_from_center = ((percent_of_range - 50) / 50) * 100;
                    var offset = (percent_dist_from_center * half_thumb_width) / 100;
                    html +=
                        '<div style="border: 1px solid transparent; display: inline-block; position: absolute; ' +
                        "left:calc(" +
                        percent_of_range +
                        "% - (" +
                        label_width_perc +
                        "% / 2) - " +
                        offset +
                        "px); text-align: center; width: " +
                        label_width_perc +
                        '%;">';
                    html += '<span style="text-align: center; font-size: 80%;">' + trial.labels[j] + "</span>";
                    html += "</div>";
                }
                html += "</div>";
                slider_container.innerHTML = html;
                // add canvas and slider to content wrapper div
                content_wrapper.insertBefore(canvas, content_wrapper.firstElementChild);
                content_wrapper.insertBefore(slider_container, canvas.nextElementSibling);
                // add content wrapper div to screen and draw image on canvas
                display_element.insertBefore(content_wrapper, null);
                if (img.complete && Number.isFinite(width) && Number.isFinite(height)) {
                    // if image has loaded and width/height have been set, then draw it now
                    // (don't rely on img onload function to draw image when image is in the cache, because that causes a delay in the image presentation)
                    ctx.drawImage(img, 0, 0, width, height);
                    image_drawn = true;
                }
                document.getElementsByClassName("jspsych-slider")["jspsych-image-slider-response-adjust-response"].style.direction = trial.slider_dir; // edit
                // add prompt if there is one
                if (trial.prompt !== null) {
                    display_element.insertAdjacentHTML("beforeend", trial.prompt);
                }
                // add submit button
                var submit_btn = document.createElement("button");
                submit_btn.id = "jspsych-image-slider-response-adjust-next";
                submit_btn.classList.add("jspsych-btn");
                submit_btn.disabled = trial.require_movement ? true : false;
                submit_btn.innerHTML = trial.button_label;
                display_element.insertBefore(submit_btn, display_element.nextElementSibling);
            } else {
                html = '<div id="jspsych-image-slider-response-adjust-wrapper" style="margin: 100px 0px;">';
                html += '<div id="jspsych-image-slider-response-adjust-stimulus">';
                html += '<img src="' + trial.stimulus + '" style="';
                if (trial.stimulus_height !== null) {
                    html += "height:" + trial.stimulus_height + "px; ";
                    if (trial.stimulus_width == null && trial.maintain_aspect_ratio) {
                        html += "width: auto; ";
                    }
                }
                if (trial.stimulus_width !== null) {
                    html += "width:" + trial.stimulus_width + "px; ";
                    if (trial.stimulus_height == null && trial.maintain_aspect_ratio) {
                        html += "height: auto; ";
                    }
                }
                html += '"></img>';
                html += "</div>";
                html +=
                    '<div class="jspsych-image-slider-response-adjust-container" style="position:relative; margin: 0 auto 3em auto; width:';
                if (trial.slider_width !== null) {
                    html += trial.slider_width + "px;";
                } else {
                    html += "auto;";
                }
                html += '">';
                html +=
                    '<input type="range" class="jspsych-slider" value="' +
                    trial.slider_start +
                    '" min="' +
                    trial.min +
                    '" max="' +
                    trial.max +
                    '" step="' +
                    trial.step +
                    '" id="jspsych-image-slider-response-adjust-esponse"></input>';
                html += "<div>";
                for (var j = 0; j < trial.labels.length; j++) {
                    var label_width_perc = 100 / (trial.labels.length - 1);
                    var percent_of_range = j * (100 / (trial.labels.length - 1));
                    var percent_dist_from_center = ((percent_of_range - 50) / 50) * 100;
                    var offset = (percent_dist_from_center * half_thumb_width) / 100;
                    html +=
                        '<div style="border: 1px solid transparent; display: inline-block; position: absolute; ' +
                        "left:calc(" +
                        percent_of_range +
                        "% - (" +
                        label_width_perc +
                        "% / 2) - " +
                        offset +
                        "px); text-align: center; width: " +
                        label_width_perc +
                        '%;">';
                    html += '<span style="text-align: center; font-size: 80%;">' + trial.labels[j] + "</span>";
                    html += "</div>";
                }
                html += "</div>";
                html += "</div>";
                html += "</div>";
                if (trial.prompt !== null) {
                    html += trial.prompt;
                }
                // add submit button
                html +=
                    '<button id="jspsych-image-slider-response-adjust-next" class="jspsych-btn" ' +
                    (trial.require_movement ? "disabled" : "") +
                    ">" +
                    trial.button_label +
                    "</button>";
                display_element.innerHTML = html;
                // set image dimensions after image has loaded (so that we have access to naturalHeight/naturalWidth)
                var img = display_element.querySelector("img");
                if (trial.stimulus_height !== null) {
                    height = trial.stimulus_height;
                    if (trial.stimulus_width == null && trial.maintain_aspect_ratio) {
                        width = img.naturalWidth * (trial.stimulus_height / img.naturalHeight);
                    }
                } else {
                    height = img.naturalHeight;
                }
                if (trial.stimulus_width !== null) {
                    width = trial.stimulus_width;
                    if (trial.stimulus_height == null && trial.maintain_aspect_ratio) {
                        height = img.naturalHeight * (trial.stimulus_width / img.naturalWidth);
                    }
                } else if (!(trial.stimulus_height !== null && trial.maintain_aspect_ratio)) {
                    // if stimulus width is null, only use the image's natural width if the width value wasn't set
                    // in the if statement above, based on a specified height and maintain_aspect_ratio = true
                    width = img.naturalWidth;
                }
                img.style.height = height.toString() + "px";
                img.style.width = width.toString() + "px";
            }

            var response = {
                rt: null,
                response: null,
            };

            if (trial.require_movement) {
                const enable_button = () => {
                    display_element.querySelector("#jspsych-image-slider-response-adjust-next").disabled = false;
                };
                display_element
                    .querySelector("#jspsych-image-slider-response-adjust-response")
                    .addEventListener("mousedown", enable_button);
                display_element
                    .querySelector("#jspsych-image-slider-response-adjust-response")
                    .addEventListener("touchstart", enable_button);
            }
            const end_trial = () => {
                this.jsPsych.pluginAPI.clearAllTimeouts();
                // save data
                var trialdata = {
                    rt: response.rt,
                    stimulus: trial.stimulus,
                    slider_minimum: trial.min,
                    slider_maximum: trial.max,
                    slider_start: trial.slider_start,
                    response: response.response,
                    slider_direction: trial.slider_dir,
                    click_num: ClickNum,
                };
                display_element.innerHTML = "";
                // next trial
                this.jsPsych.finishTrial(trialdata);
            };

            var chVal;
            var ClickNum = 0;

            display_element
                .querySelector("#jspsych-image-slider-response-adjust-response")
                .addEventListener("mouseup", () => {
                    chVal = display_element.querySelector("#jspsych-image-slider-response-adjust-response").valueAsNumber;
                    canvas.style.filter = `saturate(${chVal}%)`;
                    //canvas.style.filter = `contrast(${chVal}%)`;
                    ClickNum = ClickNum + 1;
                });


            display_element
            .querySelector("#jspsych-image-slider-response-adjust-response")
            .addEventListener("mousemove", () => {
                chVal = display_element.querySelector("#jspsych-image-slider-response-adjust-response").valueAsNumber;
                canvas.style.filter = `saturate(${chVal}%)`;
                //canvas.style.filter = `contrast(${chVal}%)`;
            });

                



            display_element
                .querySelector("#jspsych-image-slider-response-adjust-next")
                .addEventListener("mouseup", () => {
                    // measure response time
                    var endTime = performance.now();
                    response.rt = Math.round(endTime - startTime);
                    response.response = display_element.querySelector("#jspsych-image-slider-response-adjust-response").valueAsNumber;
                    if (trial.response_ends_trial) {
                        end_trial();
                    } else {
                        display_element.querySelector("#jspsych-image-slider-response-adjust-next").disabled = true;
                    }
                    chVal = 100;
                    canvas.style.filter = `saturate(${chVal}%)`;
                    //canvas.style.filter = `contrast(${chVal}%)`;
                });


            if (trial.stimulus_duration !== null) {
                this.jsPsych.pluginAPI.setTimeout(() => {
                    display_element.querySelector("#jspsych-image-slider-response-adjust-stimulus").style.visibility = "hidden";
                }, trial.stimulus_duration);
            }
            // end trial if trial_duration is set
            if (trial.trial_duration !== null) {
                this.jsPsych.pluginAPI.setTimeout(() => {
                    end_trial();
                }, trial.trial_duration);
            }
            var startTime = performance.now();

        }
    }
    ImageSliderResponseAdjustPlugin.info = info;

    return ImageSliderResponseAdjustPlugin;

})(jsPsychModule);