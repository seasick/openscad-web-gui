/*
  This is a lamp shade generator compatible with Ikea Solvinden pendant LED lamp.
  The parameters can be adjusted to fit other led lamps too.

  The lamp consists of several segments. These segments consists of "twigs"
  (the vertical columns). The segments are defined by their height and the
  upper and lower diameters. The first segment starts at the bottom with
  the `segment_diameters[0]` and is extruded for `segment_heights[0]`. The
  extrusion is scaled to match the upper diameter `segment_diameters[1]`. This
  is continued for every segment.

  Twigs can be twisted around the center of the model. 0° means they are
  just going straight up, while 360° means they are going around the whole
  model within that segment.

  There are options to insert a solar led element. This relies on a small
  "step" (lack of a better word) so that element would not just fall through.

  To get some inspiration, you can activate the "Randomizer" by enabling the
  "override values" parameter. Changing the "seed" will get you a *completely* :)
  different new model. There are 10 million different combinations.
  The used values of a random model are printed to the console. But you can
  also enable the "show labels" (Other parameters) to show the values in the
  render view.

  Be aware that rendering can take some time.
*/


/* [Shape parameters] */
// How high should each segment be?
segment_heights = [35, 35, 35, 35, 35]; // [0:2:]

// How wide should each segment be?
segment_diameters = [140, 100, 120, 90, 110, 90];

// The shape of the twig
twig_shape = "circle"; // [circle, square, ellipse]

// How much should the twigs be twisted?
twig_twist = [25, 25, 25, 0, 25];

// How much should the twigs in the counter direction be twisted?
twig_counter_twist = [25, 25, 25, 0, 25];

// How thick should a twig be?
twig_diameter = 3;

// How many twigs should there be?
twig_count = 25;

// How many twigs should be in the other direction?
twig_counter_count = 25;

// The height of the top ring
top_height = 15;

// The height of the bottom ring
bottom_height = 5;

/* [Socket parameters] */
// How big is the thing you want to put in here?
socket_diameter = 81;
socket_step_top_offset = 2;
socket_step_height = 2.5;
socket_step_diameter = 87;

/* [Randomize Parameters] */
// Override the general settings and let the randomizer go wild!
override_values = false;

// The seed for the random number generator.
seed = 1.1; // [1:1:9999999]

// The amount of segments will be chosen between those two numbers.
min_max_segment_count = [2, 5];

// The height of each segment is between those two numbers.
min_max_heights = [0, 180];

// Min/max of all the diameters.
min_max_diameters = [100, 180];

// The amount of twig twist will be between those two numbers.
min_max_twig_twist = [0, 180];

// Min/max of the twig diameter.
min_max_twig_diameter = [2, 20];

// The twig count of both twig directions will be between those two numbers.
min_max_twig_count = [5, 15];

/* [Quality settings] */
shell_fn = 5;

/* [Others] */
show_labels = false;
show_parameters = false;



// Work starts here
module __Customizer_Limit__ () {} // Just to stop the customizer


// Assert that all vectors have the same length
assert(len(twig_twist) == len(segment_heights));
assert(len(segment_diameters) == len(segment_heights) + 1);


// Overwrite general settings with random values
{
    random_seeds = rands(0, 1000, 8, seed); // Many seeds, because `rands()` is weird.
    rand_segments = ceil( // How many segments should be there?
        rands(
            min_max_segment_count[0],
            min_max_segment_count[1],
            1,
            random_seeds[0]
        )[0]
    );
    twig_types = [];


    // rand_segment_heights = rands(min_max_heights[0], min_max_heights[1], rand_segments, random_seeds[1]);
    rand_segment_heights = rand_segment_heights([], min_val = min_max_heights[0], max_val = min_max_heights[1], max_sum = 200, val_threshold = 10, max_iterations = rand_segments);
    rand_segment_diameters = rands(min_max_diameters[0], min_max_diameters[1], rand_segments, random_seeds[2]);
    rand_twig_twist = rands(min_max_twig_twist[0], min_max_twig_twist[1], rand_segments, random_seeds[3]);
    rand_twig_counter_twist = rands(min_max_twig_twist[0], min_max_twig_twist[1], rand_segments, random_seeds[4]);
    rand_twig_diameter = rands(min_max_twig_diameter[0], min_max_twig_diameter[1], 1, random_seeds[5])[0];
    rand_twig_count = ceil(rands(min_max_twig_count[0], min_max_twig_count[1], 1, random_seeds[6])[0]);
    rand_twig_counter_count = ceil(rands(min_max_twig_count[0], min_max_twig_count[1], 1, random_seeds[7])[0]);
    rand_twig_shape = "square";

    rl_segment_heights = override_values ? rand_segment_heights : segment_heights;
    rl_segment_diameters = override_values ? rand_segment_diameters : segment_diameters;
    rl_twig_twist = override_values ? rand_twig_twist : twig_twist;
    rl_twig_counter_twist = override_values ? rand_twig_counter_twist : twig_counter_twist;
    rl_twig_diameter = override_values ? rand_twig_diameter : twig_diameter;
    rl_twig_count = override_values ? rand_twig_count : twig_count;
    rl_twig_counter_count = override_values ? rand_twig_counter_count : twig_counter_count;
    rl_twig_shape = override_values ? rand_twig_shape : twig_shape;

    echo("Randomized values are:");
    echo("  segment_heights: ", rl_segment_heights);
    echo("  segment_diameters: ", rl_segment_diameters);
    echo("  twig_twist: ", rl_twig_twist);
    echo("  twig_counter_twist: ", rl_twig_counter_twist);
    echo("  twig_diameter: ", rl_twig_diameter);
    echo("  twig_count: ", rl_twig_count);
    echo("  twig_counter_count: ", rl_twig_counter_count);
    echo("  twig_shape: ", rl_twig_shape);
    echo("");
}


// Generates the whole model
module generate() {
    height = add2(rl_segment_heights); // The total height of all segments

    difference() {
        union() {
            // The outer "shell" of the lamp shade, in the "normal" direction
            outer_shell(
                rl_segment_diameters,
                rl_segment_heights,
                rl_twig_twist,
                rl_twig_diameter,
                rl_twig_shape,
                rl_twig_count
            );
            // The twigs for the outter shell in the counter direction
            if (rl_twig_counter_count > 0) {
                outer_shell(
                    rl_segment_diameters,
                    rl_segment_heights,
                    rl_twig_counter_twist,
                    rl_twig_diameter,
                    rl_twig_shape,
                    rl_twig_counter_count,
                    direction = -1
                );
            }

            // Bottom ring
            bottom_ring_d = rl_segment_diameters[0];
            ring(
                bottom_height,
                bottom_ring_d,
                bottom_ring_d - 2 * rl_twig_diameter
            );

            // Top ring
            top_ring_d = rl_segment_diameters[len(rl_segment_diameters) - 1];
            translate([0, 0, height]) {
                ring(
                    top_height,
                    top_ring_d,
                    socket_diameter // top_ring_d - 3 * rl_twig_diameter
                );
            }
        }

        // Socket step
        translate([0, 0, height + top_height - socket_step_top_offset]) {
            ring(
                socket_step_top_offset + 1, // +1 = avoid ugly fragments
                socket_step_diameter,
                socket_diameter - 10
            );
        }

        // Socket step from the other side, to only leave a small "nodge"
        translate([0, 0, height - 1]) {
            ring(
                top_height - socket_step_height - socket_step_top_offset + 1,
                socket_step_diameter,
                socket_diameter - 10
            );
        }
    }

    if (show_labels) {
        labels();
    }
}


// Generates the outter shell, the thing with the twigs running all over the place.
module outer_shell(
    segment_diameters, segment_heights, twig_twist, twig_d, twig_shape, twig_count, direction = 1
) {
    len_segments = len(segment_heights);

    $fn = shell_fn;
    for (i = [0: len_segments - 1]) {
        segment_height = segment_heights[i];
        slices = segment_height;
        twist = twig_twist[i];

        // z translate moves the segments on top of each other.
        z_translate = i == 0 ? 0 : add_max(segment_heights, i - 1);

        // "z rotate" makes the twigs of each segment go together.
        z_rotate = i == 0 ? 0 : -1 * add_max(twig_twist, i - 1);

        // Scale shrinks (or grows) the current diameter to the next one.
        scale =
            segment_diameters[i + 1] / segment_diameters[i];

        // We need the previous scale to get the twig size right.
        previous_scale = i == 0 ?
            1 :
            segment_diameters[i] / segment_diameters[0];

        // Create the twig
        rotate([0, 0, z_rotate * direction]) {
            translate([0, 0, z_translate]) {
                segment(
                    segment_height,
                    segment_diameters[i],
                    twist * direction,
                    scale,
                    slices,
                    twig_count,
                    twig_d * previous_scale,
                    twig_shape
                );
            }
        }
    }
}


// Create a single segment
module segment(
    height, d, twist, scale, slices, twig_count, twig_d, twig_shape
) {
    linear_extrude(
        height = height,
        twist = twist,
        scale = scale,
        slices = slices
    ) {
        union(){
            for (i = [0:twig_count - 1]) {
                rotate(a = 360 / twig_count * i) {
                    // `twig_d / 2` => To offset the center of the twig
                    // inside of the outer shell diameter.
                    translate([d / 2 - twig_d / 2, 0, 0]) {
                        if (twig_shape == "circle") {
                            circle(d = twig_d);
                        } else if (twig_shape == "ellipse") {
                            // translate([twig_d / 2, 0, 0])
                            scale([.5, 1.5]) circle(d = twig_d);
                        } else if (twig_shape == "square") {
                            square(twig_d, center = true);
                        }
                    }
                }
            }
        }
    }
}


// Extrude text, duh
module extrude_text(input, size = 20, clr = "gray") {
    color(clr)
        linear_extrude(height = 3)
            text(input, size = size);
}


// Draw labels. If `override_values` is set, the seed will be shown.
// `show_parameters` will render the paramters (segment height, diameter, etc).
module labels() {
    size = 20;

    if (override_values) {
        // Show seed
        translate([0, -segment_diameters[0], 0])
            color("gray")
            linear_extrude(height = 3)
                text(str("Seed:", num2str(seed)), size = size);
    }

    if (show_parameters) {
        lines = [
            str("segment_heights:", rl_segment_heights),
            str("segment_diameters:", rl_segment_diameters),
            str("twig_twist:", rl_twig_twist),
            str("twig_diameter:", rl_twig_diameter),
            str("twig_count:", rl_twig_count),
            str("twig_counter_count:", rl_twig_counter_count),
            str("twig_shape:", rl_twig_shape)
        ];

        y_offset = override_values ? size : 0;
        for (i = [0:len(lines) - 1]) {
            translate([0, -segment_diameters[0] - i * size - y_offset, 0])
                extrude_text(lines[i]);
        }
    }
}


// Copied from https://gist.github.com/Stemer114/7e420ea8ad9733c4e0ba
module ring(h = 1, od = 10, id = 5, de = 0.1) {
    $fn = od * PI;
    difference() {
        cylinder(h = h, r = od / 2);
        translate([0, 0, -de])
            cylinder(h = h + 2 * de, r = id / 2);
    }
}


// Creates a vector of numbers until a threshold is reached
function rand_vec_limit(v, min_value, max_value, max_sum, max_iterations = 0, i = 0) = (
    len(v) > 0 && (add2(v) > max_sum || max_iterations > 0 && i > max_iterations - 1) ?
        (v) :
        rand_vec_limit(concat(v, [rands(min_value, max_value, 1)[0]]), min_value, max_value, max_sum, max_iterations, i + 1)
);


function rand_segment_heights(v, min_val, max_val, max_sum, val_threshold, max_iterations, next_val = -1, i = 1) = (
    len(v) == 0 ?
        // The first one is added without any checks
        rand_segment_heights(
            concat(v, [rands(min_val, max_val, 1, seed + 1)[0]]),
            min_val, max_val, max_sum, val_threshold,
            max_iterations, rands(min_val, max_val, 1, seed + 2)[0], i + 1
        ) :
        (
            val_threshold < max_sum - (add2(v) + next_val) &&
            i < max_iterations ?
                rand_segment_heights(
                    concat(v, [next_val]),
                    min_val, max_val, max_sum, val_threshold,
                    max_iterations, rands(min_val, max_val, 1, seed + 3)[0],
                    i + 1
                ) :
                concat(v, [max_sum - add2(v)])
        )
);


// Copied from https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Tips_and_Tricks#Add_all_values_in_a_list
function add2(v) = [for(p=v) 1]*v;


// Copied and adapted from https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Tips_and_Tricks#Add_all_values_in_a_list
function add_max(v, max_idx, i = 0, r = 0) = (
    i < len(v) && i <= max_idx ?
        add_max(v, max_idx, i + 1, r + v[i]) :
        r
);

function num2str(input) = (
    str(
        floor(input / 1000000) % 10,
        floor(input / 100000) % 10,
        floor(input / 10000) % 10,
        floor(input / 1000) % 10,
        floor(input / 100) % 10,
        floor(input / 10) % 10,
        floor(input / 1) % 10
    )
);


generate();
