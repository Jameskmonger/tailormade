# tailormade

Effortlessly separate CSS (or SCSS!) into structure and design - allowing for quick and easy restyling of pages.

## Example

Given the following (very simple) code:

```scss
.hello {
    color: red;
    padding: 0;
    width: 200px;
}
```

Running it through tailormade will give you two files:

```scss
.hello {
    color: red;
}
```

```scss
.hello {
    padding: 0;
    width: 200px;
}
```

This allows you to keep your structural code and styling code separate - useful if you want to let customers change the colours easily.

For a more full example, see the `demo` directory.

## Installation

    $ npm install -g tailormade

## Usage

Tailormade is extremely easy to use. Give it a file path for your source and it will do the rest

The following command below will process `app.scss`, place the structural code into `app.structural.scss` and the design code into `app.design.scss`.

    $ tailormade app.scss

### Options

#### `-s`

File path to output the structural code to. This option is **optional**.

    $ tailormade app.scss -s structural_output.scss

If not given, a file named `app.scss` will have its structural output placed in `app.structural.scss`.

#### `-d`

File path to output the design code to. This option is **optional**.

    $ tailormade app.scss -d design_output.scss

#### `-p`

Array of properties to be used when deciding if a property is a design property. This option is **optional**.

    $ tailormade app.scss -p color background-color font-family

If not given, the defaults are:

* `color`
* `background`
* `background-color`
* `border`
* `border-color`
* `font-family`

## License

Licensed under the MIT License.