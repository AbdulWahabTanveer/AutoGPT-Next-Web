import React from "react";
import Dialog from "./Dialog";
import Button from "./Button";
import { useAuth } from "../hooks/useAuth";
import { Trans, useTranslation } from "next-i18next";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export interface SubscriptionDialogProps {
  show: boolean;
  close: () => void;
}

export const SubscriptionDialog = ({
  show,
  close,
}: SubscriptionDialogProps) => {
  const { t } = useTranslation(["chat", "common"]);
  const { push } = useRouter();
  const session = useSession();
  return (
    <Dialog
      header={`Subscribe 🔐`}
      isShown={show}
      close={close}
      footerButton={
        <Button
          onClick={() => push(`/checkoutpage?userId=${session.data?.user?.id}`)}
        >
          {t("common:Subscribe")}
        </Button>
      }
    >
      <p>Please subscribe to deploy an Agent! 🤖</p>
    </Dialog>
  );
};
