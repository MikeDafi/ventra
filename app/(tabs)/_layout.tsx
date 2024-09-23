import React from 'react';
import {useColorScheme} from '@/hooks/useColorScheme';

// pull index.tsx into _layout.tsx
import App from './index';

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return <App/>;
}
