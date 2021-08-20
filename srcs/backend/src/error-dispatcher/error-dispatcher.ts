import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { HttpException, HttpStatus } from "@nestjs/common";

let errorMap : Map<string, (e : PrismaClientKnownRequestError) => void> = new Map<string, (e : PrismaClientKnownRequestError) => void>(
	[
		// too long value
		["P2000" , (e : PrismaClientKnownRequestError) => { throw new HttpException(e.message, HttpStatus.BAD_REQUEST) }],

		// The record searched for in the where condition ({model_name}.{argument_name} = {argument_value}) does not exist
		["P2001" , (e : PrismaClientKnownRequestError) => { throw new HttpException(e.message, HttpStatus.NOT_FOUND	) }],

		// Unique constraint failed on the {constraint}
		["P2002" , (e : PrismaClientKnownRequestError) => { throw new HttpException(e.message, HttpStatus.BAD_REQUEST) }],

		// Foreign key constraint failed on the field: {field_name}
		["P2003" , (e : PrismaClientKnownRequestError) => { throw new HttpException(e.message, HttpStatus.BAD_REQUEST) }],

		// A constraint failed on the database: {database_error}
		["P2004" , (e : PrismaClientKnownRequestError) => { throw new HttpException(e.message, HttpStatus.BAD_REQUEST) }],

		// The value {field_value} stored in the database for the field {field_name} is invalid for the field's type
		["P2005" , (e : PrismaClientKnownRequestError) => { throw new HttpException(e.message, HttpStatus.NOT_ACCEPTABLE) }],

		// The provided value {field_value} for {model_name} field {field_name} is not valid
		["P2006" , (e : PrismaClientKnownRequestError) => { throw new HttpException(e.message, HttpStatus.NOT_ACCEPTABLE) }],

		// Data validation error {database_error}
		["P2007" , (e : PrismaClientKnownRequestError) => { throw new HttpException(e.message, HttpStatus.CONFLICT) }],

		// Failed to parse the query {query_parsing_error} at {query_position}
		["P2008" , (e : PrismaClientKnownRequestError) => { throw new HttpException(e.message, HttpStatus.BAD_REQUEST) }],

		// Failed to validate the query: {query_validation_error} at {query_position}
		["P2009" , (e : PrismaClientKnownRequestError) => { throw new HttpException(e.message, HttpStatus.NOT_ACCEPTABLE) }],

		// Raw query failed. Code: {code}. Message: {message}
		["P2010" , (e : PrismaClientKnownRequestError) => { throw new HttpException(e.message, HttpStatus.BAD_REQUEST) }],

		// Null constraint violation on the {constraint}
		["P2011" , (e : PrismaClientKnownRequestError) => { throw new HttpException(e.message, HttpStatus.NOT_ACCEPTABLE) }],

		// Missing a required value at {path}
		["P2012" , (e : PrismaClientKnownRequestError) => { throw new HttpException(e.message, HttpStatus.BAD_REQUEST) }],

		// Missing the required argument {argument_name} for field {field_name} on {object_name}
		["P2013" , (e : PrismaClientKnownRequestError) => { throw new HttpException(e.message, HttpStatus.BAD_REQUEST) }],

		// The change you are trying to make would violate the required relation '{relation_name}' between the {model_a_name} and {model_b_name} models
		["P2014" , (e : PrismaClientKnownRequestError) => { throw new HttpException(e.message, HttpStatus.FAILED_DEPENDENCY) }],

		// A related record could not be found. {details}
		["P2015" , (e : PrismaClientKnownRequestError) => { throw new HttpException(e.message, HttpStatus.BAD_REQUEST) }],

		// Query interpretation error. {details}
		["P2016" , (e : PrismaClientKnownRequestError) => { throw new HttpException(e.message, HttpStatus.BAD_REQUEST) }],

		// The records for relation {relation_name} between the {parent_name} and {child_name} models are not connected.
		["P2017" , (e : PrismaClientKnownRequestError) => { throw new HttpException(e.message, HttpStatus.BAD_REQUEST) }],

		// The required connected records were not found. {details}
		["P2018" , (e : PrismaClientKnownRequestError) => { throw new HttpException(e.message, HttpStatus.BAD_REQUEST) }],
	]
);

function dispatchPrismaError(error : PrismaClientKnownRequestError) {
	if (errorMap[error.code])
		errorMap[error.code](error);
	else
		throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
}

function dispatchError(error : any) {
	if (error instanceof PrismaClientKnownRequestError)
		dispatchPrismaError(error);
	else if (error instanceof HttpException)
		throw error;
	else
		throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
}

export default function ErrorDispatcher(error : any) {
	dispatchError(error);
}



