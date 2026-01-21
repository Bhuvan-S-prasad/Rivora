"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateUserBio } from "@/lib/actions/user.actions";
import { usePathname } from "next/navigation";
import { Edit } from "lucide-react";

interface Props {
    userId: string;
    currentBio: string;
}

const EditProfile = ({ userId, currentBio }: Props) => {
    const [open, setOpen] = useState(false);
    const [bio, setBio] = useState(currentBio);
    const [loading, setLoading] = useState(false);
    const pathname = usePathname();

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateUserBio({
                userId: userId,
                bio: bio,
                path: pathname
            });
            setOpen(false);
        } catch (error) {
            console.error("Failed to update bio:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="flex cursor-pointer gap-3 rounded-lg bg-dark-3 px-4 py-2">
                    <Edit size={20} />
                    <p className="text-dark-3 max-sm:hidden">Edit Bio</p>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-heading3-bold">Edit Bio</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-3">
                        <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="border-none text-dark-1 focus-visible:ring-1 focus-visible:ring-offset-1 ring-offset-light-3"
                            rows={5}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type="submit"
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-primary-500 text-light-1 hover:bg-primary-500/80"
                    >
                        {loading ? "Saving..." : "Save changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditProfile;
