import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Plus, Users, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import {
  useCreateGroupMutation,
  useGetGroupsQuery,
} from "../../store/apiSlice";
import { formatAmount, getAvatarColor, getInitials } from "../../utils/constants";
import AddGroupModal from "./AddGroupModal";
import Button from "../Button";
import EmptyState from "../EmptyState";
import Loader from "../Loader";
import { GroupSkeleton } from "../Skeleton";

function GroupList() {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.userData);
  const [showAdd, setShowAdd] = useState(false);
  const { data: groups = [], isLoading } = useGetGroupsQuery();
  const [createGroup, { isLoading: creatingGroup }] = useCreateGroupMutation();

  const loading = isLoading && groups.length === 0;

  const handleCreate = async (groupData) => {
    const result = await createGroup(groupData).unwrap();
    if (result?.id) {
      navigate(`/groups/${result.id}`);
    }
  };

  if (loading && groups.length === 0) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="animate-pulse bg-muted h-8 w-24 rounded-lg"></div>
          <div className="animate-pulse bg-muted h-10 w-32 rounded-xl"></div>
        </div>
        <div className="space-y-4">
          <GroupSkeleton />
          <GroupSkeleton />
          <GroupSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-foreground text-xl font-bold" id="groups-heading">
            Groups
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {groups.length} {groups.length === 1 ? "group" : "groups"}
          </p>
        </div>
        <Button
          onClick={() => setShowAdd(true)}
          id="create-group-btn"
          disabled={creatingGroup}
        >
          <Plus className="w-4 h-4" />
          New Group
        </Button>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          emoji=""
          title="No groups yet"
          description="Create a group to start splitting expenses with flatmates"
          action={
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <Button onClick={() => setShowAdd(true)}>
                Create First Group
              </Button>
            </div>
          }
        />
      ) : (
        <div className="space-y-3">
          {groups.map((group) => {
            const expenseCount = group.expenseCount || 0;
            const totalExpenses = group.totalExpenses || 0;

            return (
              <button
                key={group.id}
                onClick={() => navigate(`/groups/${group.id}`)}
                className="w-full bg-card rounded-2xl border border-border p-5 text-left hover:border-primary/30 hover:shadow-md transition-all group"
                id={`group-card-${group.id}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center shrink-0 text-2xl">
                    {group.emoji || "🏠"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-foreground font-semibold">
                        {group.name}
                      </p>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition" />
                    </div>
                    {group.description && (
                      <p className="text-muted-foreground mt-0.5 truncate text-xs">
                        {group.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex -space-x-2">
                        {(group.members || []).slice(0, 4).map((m) => (
                          <div
                            key={m.id}
                            className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[0.65rem] font-bold"
                            style={{ background: getAvatarColor(m.name) }}
                            title={m.name}
                          >
                            {getInitials(
                              m.linkedUserId === currentUser?.id ? "You" : m.name,
                            )}
                          </div>
                        ))}
                        {(group.members || []).length > 4 && (
                          <div className="w-7 h-7 rounded-full border-2 border-white bg-muted flex items-center justify-center text-muted-foreground text-[0.6rem] font-semibold">
                            +{group.members.length - 4}
                          </div>
                        )}
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {(group.members || []).length} members
                      </span>
                      <span className="text-muted-foreground mx-0.5">·</span>
                      <span className="text-muted-foreground text-xs">
                        {expenseCount} expenses
                      </span>
                    </div>
                  </div>
                </div>

                {/* Your balance — shown with color */}
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">
                    Total expenses
                  </span>
                  <span
                    className="font-bold text-sm"
                    style={{
                      color: totalExpenses > 0 ? "#0f172a" : "#64748b",
                    }}
                  >
                    {formatAmount(totalExpenses)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* FAB on mobile */}
      <button
        onClick={() => setShowAdd(true)}
        disabled={creatingGroup}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center sm:hidden hover:opacity-90 active:scale-95 transition-all z-40"
        id="fab-create-group"
      >
        <Plus className="w-6 h-6" />
      </button>

      {showAdd && (
        <AddGroupModal onAdd={handleCreate} onClose={() => setShowAdd(false)} />
      )}
    </div>
  );
}

export default GroupList;
