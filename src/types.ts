import { ValidationError } from './alfred-form';

export type Transform<Input, Output = Input> = (input: Input) => Output;

export type FormValues = Record<string, any>;
export type FormErrors = ValidationError[];
export type Mutable<T> = { -readonly [K in keyof T]: T[K] };
