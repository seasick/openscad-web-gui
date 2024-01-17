// Copied from https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Customizer

//Text box for vector with more than 4 elements
Vector6=[12,34,44,43,23,23];

// Text box for string
String="hello";

// Text box for string with length 8
String="length"; //8

function abc(a, b) = [a, b, 0];

AnotherStringWhichShouldNotEndUpInTheCustomizer = "hello";


module xyz(xyz=[0,0,0], size=1, color="red") {
    translate(xyz)
    color(color)
    sphere(size);
}

YetAnotherStringWhichShouldNotEndUpInTheCustomizer="hello";

xyz();
