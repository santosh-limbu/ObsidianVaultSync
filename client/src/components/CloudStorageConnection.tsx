import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiGoogledrive } from "react-icons/si";
import { Loader2 } from "lucide-react";

interface CloudStorageConnectionProps {
  onConnect: () => Promise<void>;
}

export default function CloudStorageConnection({ onConnect }: CloudStorageConnectionProps) {
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
        
        <div className="text-xs text-gray-500 text-center">
          <p>Your files will remain secure and private.</p>
          <p>We only access the folders you explicitly share.</p>
        </div>
      </CardContent>
    </Card>
  );
}
