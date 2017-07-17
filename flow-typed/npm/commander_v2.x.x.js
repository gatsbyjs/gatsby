// flow-typed signature: 9a1fb3feac221b50aab621209bf8ca9c
// flow-typed version: 94e9f7e0a4/commander_v2.x.x/flow_>=v0.28.x

declare module "commander" {
  declare class Command extends events$EventEmitter {
    /**
     * Initialize a new `Command`.
     *
     * @param {String} name
     * @api public
     */
    constructor(name?: string): Command;

    /**
     * Add command `name`.
     *
     * The `.action()` callback is invoked when the
     * command `name` is specified via __ARGV__,
     * and the remaining arguments are applied to the
     * function for access.
     *
     * When the `name` is "*" an un-matched command
     * will be passed as the first arg, followed by
     * the rest of __ARGV__ remaining.
     *
     * Examples:
     *
     *      program
     *        .version('0.0.1')
     *        .option('-C, --chdir <path>', 'change the working directory')
     *        .option('-c, --config <path>', 'set config path. defaults to ./deploy.conf')
     *        .option('-T, --no-tests', 'ignore test hook')
     *
     *      program
     *        .command('setup')
     *        .description('run remote setup commands')
     *        .action(function(){
     *          console.log('setup');
     *        });
     *
     *      program
     *        .command('exec <cmd>')
     *        .description('run the given remote command')
     *        .action(function(cmd){
     *          console.log('exec "%s"', cmd);
     *        });
     *
     *      program
     *        .command('*')
     *        .description('deploy the given env')
     *        .action(function(env){
     *          console.log('deploying "%s"', env);
     *        });
     *
     *      program.parse(process.argv);
     *
     * @param {String} name
     * @param {String} [desc]
     * @param {Mixed} [opts]
     * @return {Command} the new command
     * @api public
     */
    command(
      name: string,
      desc?: string,
      opts?: { isDefault: boolean, noHelp: boolean }
    ): Command;

    /**
     * Parse expected `args`.
     *
     * For example `["[type]"]` becomes `[{ required: false, name: 'type' }]`.
     *
     * @param {Array} args
     * @return {Command} for chaining
     * @api public
     */
    parseExpectedArgs(args: Array<string>): this;

    /**
     * Register callback `fn` for the command.
     *
     * Examples:
     *
     *      program
     *        .command('help')
     *        .description('display verbose help')
     *        .action(function(){
     *           // output help here
     *        });
     *
     * @param {Function} fn
     * @return {Command} for chaining
     * @api public
     */
    action(fn: (...args: Array<any>) => mixed): this;

    /**
     * Define option with `flags`, `description` and optional
     * coercion `fn`.
     *
     * The `flags` string should contain both the short and long flags,
     * separated by comma, a pipe or space. The following are all valid
     * all will output this way when `--help` is used.
     *
     *    "-p, --pepper"
     *    "-p|--pepper"
     *    "-p --pepper"
     *
     * Examples:
     *
     *     // simple boolean defaulting to false
     *     program.option('-p, --pepper', 'add pepper');
     *
     *     --pepper
     *     program.pepper
     *     // => Boolean
     *
     *     // simple boolean defaulting to true
     *     program.option('-C, --no-cheese', 'remove cheese');
     *
     *     program.cheese
     *     // => true
     *
     *     --no-cheese
     *     program.cheese
     *     // => false
     *
     *     // required argument
     *     program.option('-C, --chdir <path>', 'change the working directory');
     *
     *     --chdir /tmp
     *     program.chdir
     *     // => "/tmp"
     *
     *     // optional argument
     *     program.option('-c, --cheese [type]', 'add cheese [marble]');
     *
     * @param {String} flags
     * @param {String} description
     * @param {Function|Mixed} fn or default
     * @param {Mixed} defaultValue
     * @return {Command} for chaining
     * @api public
     */
    option(flags: string, description?: string, fn?: ((val: any, memo: any) => mixed) | RegExp, defaultValue?: mixed): this;
    option(flags: string, description?: string, defaultValue?: mixed): this;

    /**
     * Allow unknown options on the command line.
     *
     * @param {Boolean} arg if `true` or omitted, no error will be thrown
     * for unknown options.
     * @api public
     */
    allowUnknownOption(arg?: boolean): this;

    /**
     * Parse `argv`, settings options and invoking commands when defined.
     *
     * @param {Array} argv
     * @return {Command} for chaining
     * @api public
     */
    parse(argv: Array<string>): this;

    /**
     * Parse options from `argv` returning `argv`
     * void of these options.
     *
     * @param {Array} argv
     * @return {Array}
     * @api public
     */
    parseOptions(argv: Array<string>): { args: Array<string>, unknown: Array<string> };

    /**
     * Define argument syntax for the top-level command.
     *
     * @api public
     */
    arguments(desc: string): this;

    /**
     * Return an object containing options as key-value pairs
     *
     * @return {Object}
     * @api public
     */
    opts(): { [key: string]: any };

    /**
     * Set the program version to `str`.
     *
     * This method auto-registers the "-V, --version" flag
     * which will print the version number when passed.
     *
     * @param {String} str
     * @param {String} flags
     * @return {Command} for chaining
     * @api public
     */
    version(str: string, flags?: string): this;

    /**
     * Set the description to `str`.
     *
     * @param {String} str
     * @return {String|Command}
     * @api public
     */
    description(str: string): this;
    description(): string;

    /**
     * Set an alias for the command
     *
     * @param {String} alias
     * @return {String|Command}
     * @api public
     */
    alias(alias: string): this;
    alias(): string;

    /**
     * Set / get the command usage `str`.
     *
     * @param {String} str
     * @return {String|Command}
     * @api public
     */
    usage(str: string): this;
    usage(): string;

    /**
     * Get the name of the command
     *
     * @param {String} name
     * @return {String|Command}
     * @api public
     */
    name(): string;

    /**
     * Output help information for this command
     *
     * @api public
     */
    outputHelp(): void;

    /**
     * Output help information and exit.
     *
     * @api public
     */
    help(): void;
  }

  declare class Option {
    /**
     * Initialize a new `Option` with the given `flags` and `description`.
     *
     * @param {String} flags
     * @param {String} description
     * @api public
     */
    constructor(flags: string, description?: string): Option;
    flags: string;
    required: boolean;
    optional: boolean;
    bool: boolean;
    short?: string;
    long: string;
    description: string;
  }

  declare module.exports: Command & {
    Command: Command,
    Option: Option
  };
}
