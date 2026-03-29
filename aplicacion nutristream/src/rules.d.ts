/// <reference types="vite/client" />
import 'react-icons';

declare module 'react-icons' {
    interface IconBaseProps extends React.SVGAttributes<SVGElement> {
        className?: string;
    }
}

declare module 'react-icons/lib' {
    interface IconBaseProps extends React.SVGAttributes<SVGElement> {
        className?: string;
    }
}
