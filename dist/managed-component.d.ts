interface ComponentSettings {
    [key: string]: any;
}
interface Manager {
    addEventListener(event: string, handler: (event: any) => void | Promise<void>): void;
}
export default function (manager: Manager, settings: ComponentSettings): Promise<void>;
export {};
//# sourceMappingURL=managed-component.d.ts.map