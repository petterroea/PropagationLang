# PropagationLang

A programming language based on the definition of connections between sources and sinks. Execution happens by propagating changes downstream from the causing inlet, to depending variables. Summed up, it is as if the `Observable` concept in Javascript got its own programming language. To force you to use it, only pre-defined, "Atomic evaluators" can be used to define relations between variables.

## Example program

```
@import Binary # Tell the module which modules of atomic evaluators you want to use

@module ParseTest
	@input A # This can be controlled from the outside. As it has no value, it is not marked as dirty upon execution
	@input B = true # This can also be controlled from the outside, but has a default value.

	# We support comments
	C = Binary.Xor(A B) # Specifies a connection between C and A,B, where Xor is done on A and B, and the result is stored in C

	@output Out = Binary.And(A C) # This can be read by the outside world.
@end
```

## Language specification

The language works around modules, which are enclosed objects containing connections between inlets and outlets. Connections are defined in enclosed spaces called modules, which are named, and act as a boundary between the relations inside of it, and the rest of the program.

Each module consists of 3 different types of variables:

### Inlets

Takes in data from the outside world. This could be a file, a html control, or whatever. It's typescript, this can be(and will be once i have time) embedded in a website for live demonstration. Is not able to receive any data in.

### Outlets

Exposes its value to the outside world. Is not able to exist without any connection from another variable

### Normal variables

Acts as a connection between an inlet and an outlet. As many variables as is wanted can be chained between an inlet and an outlet. Atomic evaluators act as connections, specifying how to act on depending variables to generate a value for the variable. In the example above, `Binary.Xor` is an atomic evaluator

### Data types

The language currently only supports boolean data types, but numbers and (javascript) strings are allowed by the compiler, and only lack atomic operators to deal with them. In the future, records(Oz-style) are planned, which will open up for list support as well.

## Engine specification

Each module has its own execution context, consisting of a set of all variables, as well as a queue. At the beginning of execution, all inlets are checked for dirt. If an inlet is marked as dirty, it is marked as such. 

Execution happens by popping the first element from the queue, calculating its current value, and then marking its dependents as dirty if the value changed.

After this, the execution runs until the queue is empty, or until a specified amount of time has passed(this because javascript lacks threading, we need to handle it ourselves)

### Marking a variable as dirty

A variable is dirty if its value has changed from last time it was evaluated. When it is marked as dirty, a reference to it is placed at the back of the queue. If the vairable is already dirty when marked as such, it means it is already in the queue. If so, it is not added to the queue again.

## TODO

 * The ability to instantiate and use modules in other modules
 * Record data type
 * Number evaluators
 * List evaluators
 * More evaluators