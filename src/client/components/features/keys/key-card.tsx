import { Badge } from "@/client/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/client/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/client/components/ui/tooltip";
import { formatDateTime } from "@/client/lib/date";
import type { Key } from "@/server/domain/keys/entity";

type Props = {
  keyData: Key;
};

export const KeyCard: React.FC<Props> = ({ keyData }: Props) => {
  const isAvailable = keyData.status === "available";

  return (
    <Card>
      <CardHeader className="pb-2 flex-row items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-bold text-base leading-tight">
            {keyData.name}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {keyData.id}
          </span>
        </div>
        <Badge
          variant={isAvailable ? "success" : "warning"}
          className="shrink-0"
        >
          {isAvailable ? "空き" : "借用中"}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground">現在の状態</p>
        <p className="text-sm font-medium">
          {isAvailable ? "利用可能" : "借用中"}
        </p>
        {!isAvailable && keyData.borrowedBy && (
          <div className="mt-1 flex flex-col gap-0.5 text-sm">
            <span>{keyData.borrowedBy}</span>
            {keyData.borrowedAt && (
              <span className="text-xs text-muted-foreground font-mono tabular-nums">
                {formatDateTime(keyData.borrowedAt)}
              </span>
            )}
            {keyData.reason && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs text-muted-foreground truncate max-w-[180px] cursor-default">
                    {keyData.reason}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{keyData.reason}</TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
