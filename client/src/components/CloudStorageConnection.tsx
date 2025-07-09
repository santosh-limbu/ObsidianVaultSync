import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiGoogledrive } from "react-icons/si";
import { Loader2 } from "lucide-react";

interface CloudStorageConnectionProps {
  onConnect: () => Promise<void>;
  onSkip?: () => void;
}

export default function CloudStorageConnection({ onConnect, onSkip }: CloudStorageConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await onConnect();
    } catch (error) {
      console.error('Failed to connect to Google Drive:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-4 obsidian-sidebar border-obsidian-border">
      <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full obsidian-bg flex items-center justify-center">
          <SiGoogledrive className="w-8 h-8 text-blue-400" />
        </div>
        <CardTitle className="text-xl font-semibold text-obsidian-text">
          Connect to Google Drive
        </CardTitle>
        <CardDescription className="text-gray-400">
          Access your Obsidian vaults stored in Google Drive to start editing your notes.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full obsidian-primary hover:obsidian-secondary transition-colors px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <SiGoogledrive className="w-4 h-4" />
              <span>Connect Google Drive</span>
            </>
          )}
        </Button>
        
        {onSkip && (
          <Button
            onClick={onSkip}
            variant="outline"
            className="w-full border-obsidian-border hover:obsidian-bg transition-colors"
          >
            Try Demo Mode
          </Button>
        )}
        
        <div className="text-xs text-center text-gray-500">
          <p className="mb-2">Your files will remain secure and private.</p>
          <p className="mb-3">We only access the folders you explicitly share.</p>
          <div className="border-t border-obsidian-border pt-3">
            <p className="text-yellow-400 font-medium">Setup Required:</p>
            <p>To use Google Drive, you need to add yourself as a test user in Google Cloud Console.</p>
            <p className="mt-1">See GOOGLE_OAUTH_SETUP.md for instructions.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
