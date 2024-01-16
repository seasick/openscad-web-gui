/*
  Wannabe Acoustic Diffuser Wall Panels

  This OpenSCAD script is provided under the terms of the
  Creative Commons Attribution 4.0 International License (CC BY 4.0).

  You are free to:
  - Share: Copy and redistribute the material in any medium or format.
  - Adapt: Remix, transform, and build upon the material for any purpose, even commercially.

  Under the following terms:
  - Attribution: You must give appropriate credit (including a link to the original model),
    provide a link to license, and indicate if changes were made.
    You may do so in any reasonable manner, but not in any way that suggests the licensor
    endorses you or your use.

  The full text of the Creative Commons Attribution 4.0 International License can be found at:
  https://creativecommons.org/licenses/by/4.0/legalcode

  The orignal model can be found at https://www.printables.com/model/682650
*/

/* [Basics] */
// Size of the panel on the x-axis
length = 180;

// Size of the panel on the y-axis
depth = 180;

// Should a backplate be used?
use_backplate = false;

/* [Cube parameters] */
// Size of a single cube on the x-axis
cube_length = 20;

// Size of a single cube on the y-axis
cube_depth = 20;

// Minimum height of a single cube
cube_min_height = 5;

// Maximum height of a single cube
cube_max_height = 80;

// Wall thickness of cube
cube_wall_thickness = 1;

// Top perimeter thickness
cube_top_thickness = 2;

// Which seed to use? -1 generates a new layout with each generation
seed_value = -1;

/* [Hanging holes] */
use_hanging_holes = true;
// The thickness of the baseplate where the opening for the screw/nail is
wall_hole_thickness = 1;
// The diameter of the center hole
wall_hole_center_size = 7;
// The diameter of the screw so it can slide along the hanging hole handles
wall_hole_screw_d = 3;
// The thickness of the head of the screw, so it will fit behind the hole
wall_screw_head_size = 3;

// Stop customizer here.
module __Customizer_Limit__ () {}
Z_FIGHTING_AVOIDER = 0.01;

// Main module to generate the diffuser panel
module main() {
    x_count = length / cube_length;
    y_count = depth / cube_depth;
    random_heights_count = x_count * y_count;
    random_heights = seed_value >= 0 ?
        rands(cube_min_height, cube_max_height, random_heights_count, seed_value) :
        rands(cube_min_height, cube_max_height, random_heights_count);

    union() {
        // Loop through each cube position
        for (x = [0:x_count-1]) {
            for (y = [0:y_count-1]) {
                // Translate to the current cube position
                translate([x * cube_length, y * cube_depth, 0]) {
                    has_hanging_hole = use_hanging_holes && (
                        (x == 0 && y == 0) ||
                        (x == 0 && y == y_count - 1) ||
                        (x == x_count - 1 && y == 0) ||
                        (x == x_count - 1 && y == y_count - 1)
                    );
                    // Generate a random height for the current cube
                    random_height = random_heights[x * y_count + y];
                    // Call the module to create a cube with a diffuser design
                    wall_cube([cube_length, cube_depth, random_height], has_hanging_hole);
                }
            }
        }
    }
}

// Module to create a cube with a diffuser design
module wall_cube(dimensions, has_hanging_hole) {
    difference() {
        // Create a full cube
        cube([
            dimensions[0] + Z_FIGHTING_AVOIDER, // Prevent z-fighting and invalid 2-manifold
            dimensions[1] + Z_FIGHTING_AVOIDER,
            dimensions[2]
        ]);

        if (!use_backplate && !has_hanging_hole) {
            // Subtract an inner cube
            translate([cube_wall_thickness, cube_wall_thickness, -Z_FIGHTING_AVOIDER]) {
                x = dimensions[0] - cube_wall_thickness * 2;
                y = dimensions[1] - cube_wall_thickness * 2;
                z = dimensions[2] - cube_top_thickness;

                // During printing we will need a bit of meat, an anchor for the bridge.
                // That is, why we are using a chamfered cube.
                cube_with_upper_chamfer([x, y, z], min(x, y) * 0.2);
            }
        }

        if (has_hanging_hole) {
            // Opening for screw or nail
            translate([dimensions[0] / 2, dimensions[1] / 2, -Z_FIGHTING_AVOIDER]) {
                hanging_hole(
                    wall_hole_center_size,
                    wall_hole_screw_d,
                    min(dimensions[0], dimensions[1]) - 2,
                    wall_hole_thickness + Z_FIGHTING_AVOIDER
                );
            }
            // Space for the head of the screw or nail to fit in
            translate([cube_wall_thickness, cube_wall_thickness, wall_hole_thickness + Z_FIGHTING_AVOIDER]) {
                x = dimensions[0] - cube_wall_thickness * 2;
                y = dimensions[1] - cube_wall_thickness * 2;
                z = dimensions[2] - cube_top_thickness - wall_hole_thickness;
                cube_with_upper_chamfer([x, y, z], min(x, y) * 0.2);
            }
        }
    }
}

// Cube with a chamfer on top.
module cube_with_upper_chamfer(dimensions, size) {
    difference() {
        cube(dimensions);

        removal_size = pow(2 * pow(size, 2), 0.5);

        translate([0, 0, dimensions[2] - size])
            rotate([45, 0, 0])
            cube([
                dimensions[0],
                removal_size,
                removal_size
            ]);

        translate([0, 0, dimensions[2] - size])
            rotate([45, 0, 90])
            cube([
                dimensions[0],
                removal_size,
                removal_size
            ]);

        translate([dimensions[0], 0, dimensions[2] - size])
            rotate([45, 0, 90])
            cube([
                dimensions[0],
                removal_size,
                removal_size
            ]);

        translate([0, dimensions[1], dimensions[2] - size])
            rotate([45, 0, 0])
            cube([
                dimensions[0],
                removal_size,
                removal_size
            ]);
    }
}

module hanging_hole(center_hole, handle_size, handle_length, height) {
    union() {
        translate([0, 0, height / 2]) {
            cube([handle_length - handle_size, handle_size, height], true);
            rotate(90) cube([handle_length - handle_size, handle_size, height], true);

            cylinder(height, d = center_hole, center = true, $fn = 80);

            // Add round eges at the end of each handle
            translate([handle_length / 2 - handle_size / 2, 0, height / -2])
                cylinder(height, d=handle_size, true, $fn = 40);
            translate([handle_length / -2 + handle_size / 2, 0, height / -2])
                cylinder(height, d=handle_size, true, $fn = 40);
            translate([0, handle_length / 2 - handle_size / 2, height / -2])
                cylinder(height, d=handle_size, true, $fn = 40);
            translate([0, handle_length / -2 + handle_size / 2, height / -2])
                cylinder(height, d=handle_size, true, $fn = 40);
        }

    }
}

main();
