"use client";

import { AuthProvider } from "./AuthContext";
import { NotificationsProvider } from "./NotificationsContext";

/**
 * Providers — wrap your app/layout.jsx with this component.
 *
 * In app/layout.jsx:
 *   import { Providers } from "@/context/Providers";
 *   export default function RootLayout({ children }) {
 *     return (
 *       <html lang="en">
 *         <body>
 *           <Providers>{children}</Providers>
 *         </body>
 *       </html>
 *     );
 *   }
 */
export function Providers({ children }) {
    return (
        <AuthProvider>
            <NotificationsProvider>{children}</NotificationsProvider>
        </AuthProvider>
    );
}