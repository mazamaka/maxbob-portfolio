import * as React from "react";
import {cn} from "@/lib/utils";
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
const Input=React.forwardRef<HTMLInputElement,InputProps>(({className,type,...props},ref)=><input ref={ref} type={type} className={cn("action-input",className)} {...props}/>);
Input.displayName="Input";
export {Input};
