import { DeviceInfo } from '@/hooks/useDeviceDetect';

export function getResponsiveClasses(deviceInfo: DeviceInfo) {
    if (deviceInfo.isMobile) {
        return {
            // Login page classes
            containerPadding: 'px-6 py-8',
            titleSize: 'text-sm',
            subtitleSize: 'text-3xl',
            iconSize: 'w-4 h-4',
            inputPadding: 'pl-10',
            buttonIconSize: 'w-4 h-4',
            eyeIconSize: 16,
            imageWidth: 300,
            imageHeight: 300,
            
            // UnitModal classes
            modalMaxWidth: 'max-w-sm',
            modalImageHeight: 'h-48',
            modalCardPadding: 'p-4',
            modalIconSize: 'w-5 h-5',
            modalTextSize: 'text-base',
            modalButtonPadding: 'py-2',
            modalButtonTextSize: 'text-sm',
            modalPriceTextSize: 'text-lg',
            modalBadgeTextSize: 'text-xs',
        };
    } else if (deviceInfo.isTablet) {
        return {
            // Login page classes
            containerPadding: 'w-3/5 px-8 py-10',
            titleSize: 'text-xl',
            subtitleSize: 'text-3xl',
            iconSize: 'w-5 h-5',
            inputPadding: 'pl-14',
            buttonIconSize: 'w-5 h-5',
            eyeIconSize: 20,
            imageWidth: 400,
            imageHeight: 400,
            
            // UnitModal classes
            modalMaxWidth: 'max-w-md',
            modalImageHeight: 'h-56',
            modalCardPadding: 'p-5',
            modalIconSize: 'w-6 h-6',
            modalTextSize: 'text-lg',
            modalButtonPadding: 'py-3',
            modalButtonTextSize: 'text-base',
            modalPriceTextSize: 'text-xl',
            modalBadgeTextSize: 'text-sm',
        };
    } else {
        return {
            // Login page classes
            containerPadding: 'lg:w-1/2 lg:px-10 lg:py-20',
            titleSize: 'text-lg lg:text-2xl',
            subtitleSize: 'text-2xl sm:text-3xl',
            iconSize: 'w-5 h-5',
            inputPadding: 'pl-14',
            buttonIconSize: 'w-5 h-5',
            eyeIconSize: 20,
            imageWidth: 600,
            imageHeight: 600,
            
            // UnitModal classes
            modalMaxWidth: 'max-w-md',
            modalImageHeight: 'h-64',
            modalCardPadding: 'p-6',
            modalIconSize: 'w-6 h-6',
            modalTextSize: 'text-lg',
            modalButtonPadding: 'py-4',
            modalButtonTextSize: 'text-base',
            modalPriceTextSize: 'text-2xl',
            modalBadgeTextSize: 'text-sm',
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

// New function to get modal-specific responsive classes
export function getModalResponsiveClasses(deviceInfo: DeviceInfo) {
    const baseClasses = getResponsiveClasses(deviceInfo);
    
    return {
        // Modal container
        containerMaxWidth: baseClasses.modalMaxWidth,
        containerMaxHeight: deviceInfo.isMobile ? 'max-h-[90vh]' : 'max-h-[85vh]',
        
        // Image section
        imageHeight: baseClasses.modalImageHeight,
        imageContainerPadding: deviceInfo.isMobile ? 'p-3' : 'p-4',
        
        // Content cards
        cardPadding: baseClasses.modalCardPadding,
        iconSize: baseClasses.modalIconSize,
        
        // Text sizes
        titleSize: deviceInfo.isMobile ? 'text-lg' : 'text-xl',
        subtitleSize: baseClasses.modalTextSize,
        priceTextSize: baseClasses.modalPriceTextSize,
        badgeTextSize: baseClasses.modalBadgeTextSize,
        
        // Buttons
        buttonPadding: baseClasses.modalButtonPadding,
        buttonTextSize: baseClasses.modalButtonTextSize,
        
        // Grid layout
        gridCols: deviceInfo.isMobile ? 'grid-cols-2' : 'grid-cols-2',
        
        // Spacing
        sectionSpacing: deviceInfo.isMobile ? 'space-y-3' : 'space-y-3',
        cardSpacing: deviceInfo.isMobile ? 'gap-3' : 'gap-3',
    };
}