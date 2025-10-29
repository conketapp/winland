import { DeviceInfo } from '@/hooks/useDeviceDetect';

export function getResponsiveClasses(deviceInfo: DeviceInfo) {
    if (deviceInfo.isMobile) {
        return {
            containerPadding: 'px-6 py-8',
            titleSize: 'text-sm',
            subtitleSize: 'text-3xl',
            iconSize: 'w-4 h-4',
            inputPadding: 'pl-10',
            buttonIconSize: 'w-4 h-4',
            eyeIconSize: 16,
            imageWidth: 300,
            imageHeight: 300,
        };
    } else if (deviceInfo.isTablet) {
        return {
            containerPadding: 'w-3/5 px-8 py-10',
            titleSize: 'text-xl',
            subtitleSize: 'text-3xl',
            iconSize: 'w-5 h-5',
            inputPadding: 'pl-14',
            buttonIconSize: 'w-5 h-5',
            eyeIconSize: 20,
            imageWidth: 400,
            imageHeight: 400,
        };
    } else {
        return {
            containerPadding: 'lg:w-1/2 lg:px-10 lg:py-20',
            titleSize: 'text-lg lg:text-2xl',
            subtitleSize: 'text-2xl sm:text-3xl',
            iconSize: 'w-5 h-5',
            inputPadding: 'pl-14',
            buttonIconSize: 'w-5 h-5',
            eyeIconSize: 20,
            imageWidth: 600,
            imageHeight: 600,
        };
    }
}

export function getBreakpointClass(deviceInfo: DeviceInfo, classes: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    largeDesktop?: string;
}) {
    if (deviceInfo.isMobile) return classes.mobile || '';
    if (deviceInfo.isTablet) return classes.tablet || '';
    if (deviceInfo.isDesktop) return classes.desktop || '';
    if (deviceInfo.isLargeDesktop) return classes.largeDesktop || '';
    return '';
}