import { useState, useEffect } from "react";
import { Bell, Check, Trash2, AlertTriangle, Calendar, Users, Wallet, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/config/supabase";
import { useAuth } from "@/hooks/user/useAuth";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_id: string | null;
  related_type: string | null;
}

export function NotificationBell() {
  // const { user } = useAuth();
  // const [notifications, setNotifications] = useState<Notification[]>([]);
  // const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  // useEffect(() => {
  //   if (user) {
  //     fetchNotifications();
  //     generateSystemNotifications();
  //   }
  // }, [user]);

  // const fetchNotifications = async () => {
  //   if (!user) return;

  //   const { data, error } = await supabase
  //     .from("notifications")
  //     .select("*")
  //     .eq("user_id", user.id)
  //     .order("created_at", { ascending: false })
  //     .limit(20);

  //   if (data) {
  //     setNotifications(data);
  //     setUnreadCount(data.filter((n) => !n.is_read).length);
  //   }
  // };

  // const generateSystemNotifications = async () => {
  //   if (!user) return;

  //   const today = new Date().toISOString().split("T")[0];
  //   const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  //   // Check for overdue expenses
  //   const { data: overdueExpenses } = await supabase
  //     .from("expenses")
  //     .select("id, description, expense_date")
  //     .eq("user_id", user.id)
  //     .eq("is_paid", false)
  //     .lt("expense_date", today);

  //   // Check for overdue incomes
  //   const { data: overdueIncomes } = await supabase
  //     .from("incomes")
  //     .select("id, description, income_date")
  //     .eq("user_id", user.id)
  //     .eq("is_paid", false)
  //     .lt("income_date", today);

  //   // Check for overdue installments
  //   const { data: overdueInstallments } = await supabase
  //     .from("financing_installments")
  //     .select("id, installment_number, due_date, financing_id")
  //     .eq("is_paid", false)
  //     .lt("due_date", today);

  //   // Check for upcoming expenses (next 3 days)
  //   const { data: upcomingExpenses } = await supabase
  //     .from("expenses")
  //     .select("id, description, expense_date")
  //     .eq("user_id", user.id)
  //     .eq("is_paid", false)
  //     .gte("expense_date", today)
  //     .lte("expense_date", inThreeDays);

  //   // Create notifications for overdue items
  //   type NotificationType = "overdue_expense" | "overdue_income" | "overdue_installment" | "upcoming_expense" | "upcoming_installment" | "space_invite" | "space_member_joined" | "savings_goal_reached" | "general";
    
  //   interface NewNotification {
  //     type: NotificationType;
  //     title: string;
  //     message: string;
  //     related_id: string;
  //     related_type: string;
  //   }

  //   const newNotifications: NewNotification[] = [];

  //   overdueExpenses?.forEach((expense) => {
  //     newNotifications.push({
  //       type: "overdue_expense",
  //       title: "Despesa vencida",
  //       message: `A despesa "${expense.description}" está vencida`,
  //       related_id: expense.id,
  //       related_type: "expense",
  //     });
  //   });

  //   overdueIncomes?.forEach((income) => {
  //     newNotifications.push({
  //       type: "overdue_income",
  //       title: "Entrada não recebida",
  //       message: `A entrada "${income.description}" não foi recebida`,
  //       related_id: income.id,
  //       related_type: "income",
  //     });
  //   });

  //   overdueInstallments?.forEach((installment) => {
  //     newNotifications.push({
  //       type: "overdue_installment",
  //       title: "Parcela vencida",
  //       message: `A parcela ${installment.installment_number} está vencida`,
  //       related_id: installment.id,
  //       related_type: "installment",
  //     });
  //   });

  //   upcomingExpenses?.forEach((expense) => {
  //     newNotifications.push({
  //       type: "upcoming_expense",
  //       title: "Despesa próxima",
  //       message: `A despesa "${expense.description}" vence em breve`,
  //       related_id: expense.id,
  //       related_type: "expense",
  //     });
  //   });

  //   // Insert new notifications (check for duplicates first)
  //   for (const notif of newNotifications) {
  //     const { data: existing } = await supabase
  //       .from("notifications")
  //       .select("id")
  //       .eq("user_id", user.id)
  //       .eq("related_id", notif.related_id)
  //       .eq("type", notif.type)
  //       .single();

  //     if (!existing) {
  //       await supabase.from("notifications").insert({
  //         user_id: user.id,
  //         type: notif.type,
  //         title: notif.title,
  //         message: notif.message,
  //         related_id: notif.related_id,
  //         related_type: notif.related_type,
  //       });
  //     }
  //   }

  //   // Refresh notifications
  //   fetchNotifications();
  // };

  // const markAsRead = async (id: string) => {
  //   await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  //   fetchNotifications();
  // };

  // const markAllAsRead = async () => {
  //   if (!user) return;
  //   await supabase
  //     .from("notifications")
  //     .update({ is_read: true })
  //     .eq("user_id", user.id)
  //     .eq("is_read", false);
  //   fetchNotifications();
  // };

  // const deleteNotification = async (id: string) => {
  //   await supabase.from("notifications").delete().eq("id", id);
  //   fetchNotifications();
  // };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "overdue_expense":
      case "upcoming_expense":
        return <Wallet className="h-4 w-4 text-destructive" />;
      case "overdue_income":
        return <Wallet className="h-4 w-4 text-yellow-500" />;
      case "overdue_installment":
      case "upcoming_installment":
        return <Calendar className="h-4 w-4 text-destructive" />;
      case "space_invite":
      case "space_member_joined":
        return <Users className="h-4 w-4 text-primary" />;
      case "savings_goal_reached":
        return <PiggyBank className="h-4 w-4 text-green-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative cursor-pointer">
          <Bell className="h-5 w-5" />
          {/* {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )} */}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        {/* <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="font-semibold text-foreground">Notificações</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <Check className="mr-1 h-3 w-3" />
              Marcar todas como lidas
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="mb-3 h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Nenhuma notificação
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex gap-3 p-4 transition-colors hover:bg-muted/50",
                    !notification.is_read && "bg-primary/5"
                  )}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea> */}
      </PopoverContent>
    </Popover>
  );
}
